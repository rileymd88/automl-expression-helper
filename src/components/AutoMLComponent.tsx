import React, { useState, useEffect, useCallback } from "react";
import { Snackbar, Alert, RadioGroup, FormControlLabel, Radio, Box } from "@mui/material";

import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Autocomplete,
  Paper,
  CircularProgress,
  Divider,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  TextareaAutosize,
  useMediaQuery,
  useTheme,
  styled,
  Tooltip,
  type PaperProps,
  type DividerProps,
} from "@mui/material";
import CloseIcon from "@qlik-trial/sprout/icons/react/Close";
import ArrowUpIcon from "@qlik-trial/sprout/icons/react/ArrowUp";
import ClipboardIcon from "@qlik-trial/sprout/icons/react/Clipboard";
import {
  getFeatures,
  getConnections,
  getTarget,
  getFields,
  getBinaryReturnFields,
  getMultiClassReturnFields,
  getSpaceName,
  getAppSpaceId,
} from "../helper";
import SearchableMenuButton from "./SearchableMenuButton";
import type {
  Variable,
  VariableModel,
  Feature,
  AutoMLConnection,
  Target,
} from "../types";

import { stardust } from "@nebula.js/stardust";


const StyledPaper: React.FC<PaperProps> = (props) => (
  <Paper sx={{ padding: "8px", marginBottom: "10px" }} {...props} />
);

const StyledDialog = styled(Dialog)(({ theme }) => ({
  zIndex: theme.zIndex.drawer,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3, 5),
}));

const StyledDivider: React.FC<DividerProps> = (props) => (
  <Divider sx={{ marginTop: "10px" }} {...props} />
);

// metadata.expression
// automl.view.deployment
// automl.view.createExpression
interface AutoMLExpressionComponentProps {
    app: EngineAPI.IApp | undefined;
    translator: stardust.Translator;
    open: boolean;
    setOpen: (open: boolean) => void;
}

interface MasterItem {
  qId: string;
  title: string;
}

const AutoMLExpressionComponent = ({app, translator, open, setOpen}: AutoMLExpressionComponentProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [connections, setConnections] = useState<AutoMLConnection[]>([]);
  const [connection, setConnection] = useState<AutoMLConnection | null>(null);
  const [returnField, setReturnField] = useState<string | null>(null);
  const [returnFields, setReturnFields] = useState<string[]>([]);
  const [hideDialog, setHideDialog] = useState<boolean>(false);
  const [variableModel, setVariableModel] = useState<VariableModel | null>(
    null
  );
  const [variables, setVariables] = useState<Variable[]>([]);
  const [finalExpression, setFinalExpression] = useState<string>("");
  const [showCopyMsg, setShowCopyMsg] = useState(false);
  const [target, setTarget] = useState<Target>({
    type: "regression",
    field: "",
  });
  const [masterItemName, setMasterItemName] = useState<string>("");
  const [isCreatingMasterItem, setIsCreatingMasterItem] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [masterItems, setMasterItems] = useState<MasterItem[]>([]);
  const [selectedMasterItem, setSelectedMasterItem] = useState<MasterItem | null>(null);
  const [dialogTitle, setDialogTitle] = useState('Create AutoML expression');
  const [appSpaceId, setAppSpaceId] = useState<string | null>(null);
  const [fields, setFields] = useState<string[]>([]);

  const mapFeatures = async (tmpFeatures: Feature[]) => {
    if (!tmpFeatures || tmpFeatures.length === 0) {
      return;
    }
    if (!app) {
      setFeatures(tmpFeatures);
      return;
    }
    try {
      const fields = await getFields(app);
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        for (let j = 0; j < tmpFeatures.length; j++) {
          const feat = tmpFeatures[j];
          if (feat.name === field) {
            feat.expression = `[${field}]`;
            tmpFeatures[j] = feat;
          }
        }
      }
    } catch (error) {
      return;
    }
    setFeatures(tmpFeatures);
  };

  useEffect(() => {
    async function setup() {
      const c = await getConnections();
      setConnections(c);
    }
    setup();
  }, []);

  function isValidType(type: string | undefined) {
    return type === "binary" || type === "multiclass";
  }

  async function fetchFeaturesData(c: AutoMLConnection) {
    const f = await getFeatures(c.deploymentId);
    mapFeatures(f.features);
    return f;
  }

  async function handleReturnFields(c: AutoMLConnection, targetResult: Target) {
    const { type, field } = targetResult;
    let rfs;
    if (type === "binary") {
      rfs = await getBinaryReturnFields(c.deploymentId, field);
    } else if (type === "multiclass") {
      rfs = await getMultiClassReturnFields(c.deploymentId, field);
    }
    if(rfs !== undefined) {
        setReturnFields(rfs);
        setReturnField(rfs[0]);
    }
  }

  async function fetchTargetData(id: string) {
    const targetResult = await getTarget(id);
    setTarget(targetResult);
    return targetResult;
  }

  useEffect(() => {
    async function fetchFeatures() {
      if (mode === 'create' && connection !== null) {
        setLoading(true);
        try {
          const f = await fetchFeaturesData(connection);
          const targetResult = await fetchTargetData(f.experimentVersionId);
          if (isValidType(targetResult.type)) {
            await handleReturnFields(connection, targetResult);
          }
        } catch (error) {
          console.error("Error fetching features:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchFeatures();
  }, [mode, connection, app]);

  useEffect(() => {
    if (app) {
      const loadVariables = async () => {
        try {
          let vm = variableModel;
          if (vm === null) {
            vm = await app.getVariableListObject() as VariableModel;
            setVariableModel(vm);
            return;
          }
          const vs = await vm.getLayout();
          setVariables(vs);
        } catch (error) {
          console.error('Error loading variables:', error);
        }
      };
      loadVariables();
    }
  }, [app, open]);

  useEffect(() => {
    if (app) {
      const fetchAppSpaceId = async () => {
        const spaceId = await getAppSpaceId(app);
        console.log('app space id', spaceId);
        setAppSpaceId(spaceId);
      };
      fetchAppSpaceId();
    }
  }, [app]);

  useEffect(() => {
    if (open) {
      const updateFinalExpression = async () => {
        if (
          connection !== null &&
          features.length > 0 &&
          returnField !== null &&
          appSpaceId !== null
        ) {
          const dataTypes = features
            .map((f) => (f.type === "Categorical" ? "S" : "N"))
            .join("");
          let fields = "";
          features.forEach((f, i) => {
            fields +=
              f.expression === f.name
                ? f.expression
                : `${
                    f.expression.charAt(0) === "="
                      ? f.expression.slice(1)
                      : f.expression
                  } as [${f.name}]`;
            if (i !== features.length - 1) {
              fields += `,\n`;
            }
          });

          let connectionName = connection.name;
          if (connection.spaceId !== appSpaceId) {
            const spaceName = await getSpaceName(connection.spaceId);
            connectionName = `${spaceName}:${connectionName}`;
          }

          const exp = `endpoints.ScriptEvalEx('${dataTypes}','{"RequestType":"endpoint", "endpoint":{"connectionname":"${connectionName}", "column": "${returnField}"}}', \n ${fields}\n)`;
          setFinalExpression(exp);
        }
      };
      updateFinalExpression();
    }
  }, [features, connection, returnField, appSpaceId]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFeatureChange = (expression: string, index: number) => {
    const newFeatures = [...features];
    newFeatures[index].expression = expression;
    setFeatures(newFeatures);
  };

  const EnhancedTableHead = useCallback(
    () => (
      <TableHead>
        <TableRow>
          <TableCell key="field">Feature</TableCell>
          <TableCell>Feature type</TableCell>
          <TableCell colSpan={2}>Expression</TableCell>
        </TableRow>
      </TableHead>
    ),
    []
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(finalExpression);
    setShowCopyMsg(true);
    setTimeout(() => {
      setShowCopyMsg(false);
    }, 2000);
  };

  const handleCreateMasterItem = async () => {
    if (app && masterItemName && finalExpression) {
      setIsCreatingMasterItem(true);
      try {
        const measureDef = {
          qInfo: {
            qType: 'measure'
          },
          qMeasure: {
            qLabel: masterItemName,
            qDef: finalExpression
          },
          qMetaDef: {
            title: masterItemName,
            description: '',
          },
          autoMlExpressionHelper: {
            features,
            connection,
            returnField,
            target,
            returnFields
          }
        };

        if (mode === 'create') {
          await app.createMeasure(measureDef);
        } else if (mode === 'edit' && selectedMasterItem) {
          const measure = await app.getMeasure(selectedMasterItem.qId);
          await measure.setProperties(measureDef);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        handleClose();
        setShowSuccessToast(true);
      } catch (error) {
        console.error('Error creating/updating master measure:', error);
      } finally {
        setIsCreatingMasterItem(false);
      }
    }
  };

  const handleCloseToast = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowSuccessToast(false);
  };

  useEffect(() => {
    if (app && mode === 'edit') {
      fetchMasterItems();
    }
  }, [app, mode]);

  const fetchMasterItems = async () => {
    if (!app) return;

    try {
      const sessionObject = await app.createSessionObject({
        qInfo: {
          qType: 'MeasureList'
        },
        qMeasureListDef: {
          qType: 'measure',
          qData: {
            title: '/qMetaDef/title',
            tags: '/qMetaDef/tags'
          }
        }
      });

      const layout = await sessionObject.getLayout();
      const allItems = layout.qMeasureList.qItems;

      const filteredItems = await Promise.all(
        allItems.map(async (item: any) => {
          try {
            const measure = await app.getMeasure(item.qInfo.qId);
            const measureLayout = await measure.getLayout();
            if (measureLayout.autoMlExpressionHelper) {
              return {
                qId: item.qInfo.qId,
                title: item.qMeta.title
              };
            }
          } catch (error) {
            console.error(`Error fetching measure ${item.qInfo.qId}:`, error);
          }
          return null;
        })
      );

      const validItems = filteredItems.filter((item): item is MasterItem => item !== null);
      setMasterItems(validItems);
    } catch (error) {
      console.error('Error fetching master items:', error);
    }
  };

  const loadMasterItem = async (masterItem: MasterItem) => {
    if (!app) return;

    try {
      const measure = await app.getMeasure(masterItem.qId);
      const layout = await measure.getLayout();
      const { qLabel, qDef } = layout.qMeasure;
      const autoMlExpressionHelper = layout.autoMlExpressionHelper;
      setMasterItemName(qLabel);
      setFinalExpression(qDef);

      if (autoMlExpressionHelper) {
        const { 
          features: featuresData, 
          connection: connectionData, 
          returnField: returnFieldData,
          target: targetData,
          returnFields: returnFieldsData
        } = autoMlExpressionHelper;
        
        setFeatures(featuresData);
        setConnection(connectionData);
        setReturnField(returnFieldData);
        setTarget(targetData);
        setReturnFields(returnFieldsData);
      }
    } catch (error) {
      console.error('Error loading master item:', error);
    }
  };

  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = event.target.value as 'create' | 'edit';
    setMode(newMode);
    setDialogTitle(newMode === 'create' ? 'Create AutoML expression' : 'Edit AutoML expression');
    if (newMode === 'create') {
      resetForm();
    }
  };

  const resetForm = () => {
    setMasterItemName('');
    setFinalExpression('');
    setFeatures([]);
    setConnection(null);
    setReturnField(null);
    setSelectedMasterItem(null);
  };

  useEffect(() => {
    if(connection && connection.spaceId === 'personal' && mode === 'create') {
      setMode('create');
    }
  }, [connection, mode]);

  useEffect(() => {
    if (app) {
      const fetchFields = async () => {
        const fieldList = await getFields(app);
        setFields(fieldList);
      };
      fetchFields();
    }
  }, [app]);

  return (
    <Box 
      className="pp-component pp-string-component pp-automl-expression-component"
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        height: '100%' 
      }}
    >
      <Button 
        sx={{ width: '100%' }} 
        variant="outlined" 
        onClick={handleClickOpen}
      >
        {translator.get('Create AutoML Expression')}
      </Button>
      <StyledDialog
        sx={{
          zIndex: hideDialog ? 0 : theme.zIndex.drawer,
          visibility: hideDialog ? "hidden" : "inherit",
        }}
        open={open}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
        onClose={handleClose}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          <Typography>{dialogTitle}</Typography>
          <StyledDivider />
          <Button
            onClick={() => handleClose()}
            data-tid="close-add-bookmark-dialog"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon height="12px" />
          </Button>
        </DialogTitle>
        <StyledDialogContent>
          <StyledPaper>
            <Typography variant="h3">Mode</Typography>
            <RadioGroup row value={mode} onChange={handleModeChange}>
              <FormControlLabel value="create" control={<Radio />} label="Create" />
              <FormControlLabel value="edit" control={<Radio />} label="Edit" />
            </RadioGroup>
          </StyledPaper>

          {mode === 'create' && (
            <StyledPaper>
              <Typography variant="h3">Select connection</Typography>
              <StyledDivider />
              <Autocomplete
                sx={{ width: "40%", marginBottom: "8px" }}
                value={connection}
                onChange={(event, newConnectionValue) => {
                  setConnection(newConnectionValue);
                }}
                options={connections}
                getOptionLabel={(o) => o.name}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select a connection" />
                )}
              />
            </StyledPaper>
          )}

          {mode === 'edit' && (
            <StyledPaper>
              <Typography variant="h3">Select master item</Typography>
              <StyledDivider />
              <Autocomplete
                sx={{ width: "40%", marginTop: "8px", marginBottom: "8px" }}
                value={selectedMasterItem}
                onChange={(event, newValue) => {
                  setSelectedMasterItem(newValue);
                  if (newValue) {
                    loadMasterItem(newValue);
                  }
                }}
                options={masterItems}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => <TextField {...params} placeholder="Select a master item" />}
              />
            </StyledPaper>
          )}

          {((mode === 'create' && connection !== null) || (mode === 'edit' && selectedMasterItem !== null)) && !loading && target ? (
            <>
              <StyledPaper>
                <Typography variant="h3">Map expressions</Typography>
                <StyledDivider />
                <TableContainer sx={{ marginTop: "8px" }}>
                  <Table size="medium">
                    <EnhancedTableHead />
                    <TableBody>
                      {features.map((row, index) => (
                        <TableRow tabIndex={-1} key={row.name}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.type}</TableCell>
                          <TableCell sx={{ padding: "8px", height: "40px" }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <TextField
                                sx={{maxHeight: 32, margin: 0}}
                                fullWidth
                                value={row.expression || ''}
                                onChange={(e) => handleFeatureChange(e.target.value, index)}
                                placeholder="Enter expression"
                              />
                              <SearchableMenuButton
                                options={variables
                                  .filter(
                                    (v) => !v.qIsConfig && !v.qIsScriptCreated
                                  )
                                  .map((v) => v.qName)}
                                fields={fields}
                                handleFeatureChange={handleFeatureChange}
                                index={index}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </StyledPaper>

              {(target.type === "binary" || target.type === "multiclass") && (
                <StyledPaper>
                  <Typography variant="h3">Select return field</Typography>
                  <StyledDivider />
                  <Autocomplete
                    sx={{ width: "40%", marginBottom: "8px" }}
                    value={returnField}
                    onChange={(event, newReturnField) => {
                      setReturnField(newReturnField);
                    }}
                    options={returnFields}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select return field" />
                    )}
                  />
                </StyledPaper>
              )}

              <StyledPaper>
                <Typography variant="h3">Master item name</Typography>
                <StyledDivider />
                <TextField
                  fullWidth
                  value={masterItemName}
                  onChange={(e) => setMasterItemName(e.target.value)}
                  placeholder="Enter master item name"
                  sx={{ marginTop: "8px", marginBottom: "16px" }}
                />
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ArrowUpIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>Expression preview</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button onClick={handleCopy} sx={{ minWidth: 'auto' }}>
                        <Tooltip
                          open={showCopyMsg}
                          PopperProps={{
                            disablePortal: true,
                          }}
                          disableFocusListener
                          disableHoverListener
                          disableTouchListener
                          title="Copied!"
                        >
                          <ClipboardIcon />
                        </Tooltip>
                      </Button>
                    </Box>
                    <TextareaAutosize
                      disabled
                      value={finalExpression}
                      minRows={3}
                      style={{ resize: "both", width: "100%", maxWidth: "100%" }}
                    />
                  </AccordionDetails>
                </Accordion>
              </StyledPaper>
            </>
          ) : null}

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginTop: "32px",
              }}
            >
              {" "}
              <CircularProgress />{" "}
            </Box>
          ) : null}
        </StyledDialogContent>
        <DialogActions>
          <Button onClick={() => handleClose()} variant="outlined" disabled={isCreatingMasterItem}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateMasterItem}
            color="primary"
            variant="contained"
            disabled={features.some((f) => f.expression === "") || masterItemName.trim() === "" || isCreatingMasterItem}
          >
            {isCreatingMasterItem ? <CircularProgress size={24} /> : (mode === 'create' ? "Create master item" : "Update master item")}
          </Button>
        </DialogActions>
      </StyledDialog>
      <Snackbar open={showSuccessToast} autoHideDuration={3000} onClose={handleCloseToast}>
        <Alert onClose={handleCloseToast} severity="success" sx={{ width: '100%' }}>
          Master item {mode === 'create' ? 'created' : 'updated'} successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AutoMLExpressionComponent;
