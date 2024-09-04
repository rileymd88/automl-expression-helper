import { Doc } from "@qlik/api/qix";

type DataConnectionRequest = {
  id: string;
  datasourceID: string;
  qConnectStatement: string;
  qName: string;
  space: string;
};

type AutoMLConnection = {
  id: string;
  name: string;
  deploymentId: string;
  deplyomentName: string;
  spaceId: string;
};

type FeatureRequest = {
  name: string;
  dtype: string;
};

const parseDeploymentId = (str: string) => {
  const pattern = /deploymentId=([a-f\d-]+)/;
  const match = pattern.exec(str);
  return match ? match[1] : null;
};

export const getAppSpaceId = async (app: Doc) => {
  const appResponse = await fetch(`../api/v1/apps/${app.id}`);
  const appJson = await appResponse.json();
  if (appJson.attributes.spaceId) {
    return appJson.attributes.spaceId;
  }
  return 'personal';
};

export const getSpaceName = async (id: string) => {
  const response = await fetch(`../api/v1/spaces/${id}`);
  const json = await response.json();
  return json.name;
};

export const getConnections = async () => {
  const dcResponse = await fetch('../api/v1/data-connections');
  const dcJson = await dcResponse.json();
  const dataConnections = dcJson.data
    .filter((c: DataConnectionRequest) => c.datasourceID === 'mlautoml')
    .map((c: DataConnectionRequest) => ({
      deploymentId: parseDeploymentId(c.qConnectStatement),
      connectionId: c.id,
      connectionName: c.qName,
      spaceId: c.space || 'personal',
    }));
  const connections: AutoMLConnection[] = [];
  for (let i = 0; i < dataConnections.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch(
      `../api/v1/items?resourceType=automl-deployment&resourceId=${dataConnections[i].deploymentId}`
    );
    // eslint-disable-next-line no-await-in-loop
    const json = await response.json();
    if (json.data.length > 0) {
      connections.push({
        id: dataConnections[i].connectionId,
        name: dataConnections[i].connectionName,
        deploymentId: json.data[0].resourceAttributes.modelId,
        deplyomentName: json.data[0].name,
        spaceId: dataConnections[i].spaceId,
      });
    }
  }
  return connections;
};

const getCsrfToken = async () => {
  const response = await fetch('../api/v1/csrf-token');
  return response.headers.get('qlik-csrf-token');
};

export const getFeatures = async (id: string) => {
  const csrfToken = await getCsrfToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (csrfToken) {
    headers['qlik-csrf-token'] = csrfToken;
  }
  const response = await fetch('../api/v1/automl/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      operationName: 'Model',
      query:
        'query Model($id: String!) {  model(id: $id) {    info {      ...ModelFragment    }    schema {      columns {        name        dtype      }    }    metrics {      __typename      ... on BinaryMetrics {        ...BinaryMetricsFragment      }      ... on MulticlassMetrics {        ...MulticlassMetricsFragment      }      ... on RegressionMetrics {        ...RegressionMetricsFragment      }    }    hyperparameters {      ... on LogisticRegressionHyperparameters {        ...LogisticRegressionFragment      }      ... on ElasticnetRegressionHyperparameters {        ...ElasticnetFragment      }      ... on RandomForestClassifierHyperparameters {        ...RandomForestClassifierFragment      }      ... on XGBClassifierHyperparameters {        ...XGBClassifierFragment      }      ... on KNeighborsClassifierHyperparameters {        ...KNeighborsClassifierFragment      }      ... on RandomForestRegressionHyperparameters {        ...RandomForestRegressionFragment      }      ... on XGBRegressionHyperparameters {        ...XGBRegressionFragment      }      ... on SGDRegressionHyperparameters {        ...SGDRegressionFragment      }      ... on LassoHyperparameters {        ...LassoFragment      }      ... on LassoRegressionHyperparameters {        ...LassoRegressionFragment      }      ... on CatBoostRegressionHyperparameters {        ...CatboostRegressionHyperparametersFragment      }      ... on CatBoostClassifierHyperparameters {        ...CatboostClassifierHyperparametersFragment      }      ... on LGBMClassifierHyperparameters {        ...LGBMClassifierFragment      }      ... on LGBMRegressionHyperparameters {        ...LGBMRegressionFragment      }    }  }}        fragment ModelFragment on Model {  id  experimentVersionId  createdAt  updatedAt  deletedAt  batchNum  algorithm  status  errorMessage  hpoNum}        fragment BinaryMetricsFragment on BinaryMetrics {  accuracy  accuracyTest  auc  aucTest  f1  f1Test  fallout  falloutTest  falseNegative  falseNegativeTest  falsePositive  falsePositiveTest  logLoss  logLossTest  mcc  mccTest  missRate  missRateTest  npv  npvTest  precision  precisionTest  recall  recallTest  specificity  specificityTest  threshold  thresholdTest  trueNegative  trueNegativeTest  truePositive  truePositiveTest}        fragment MulticlassMetricsFragment on MulticlassMetrics {  f1Macro  f1MacroTest  f1Micro  f1MicroTest  f1Weighted  f1WeightedTest  accuracy  accuracyTest}        fragment RegressionMetricsFragment on RegressionMetrics {  mae  maeTest  mse  mseTest  r2  r2Test  rmse  rmseTest}        fragment LogisticRegressionFragment on LogisticRegressionHyperparameters {  c  penalty}        fragment ElasticnetFragment on ElasticnetRegressionHyperparameters {  c  penalty}        fragment RandomForestClassifierFragment on RandomForestClassifierHyperparameters {  minSamplesSplit  maxDepth  minSamplesLeaf  nEstimators  maxFeatures}        fragment XGBClassifierFragment on XGBClassifierHyperparameters {  maxDepth  gamma  nEstimators  minChildWeight  subsample  learningRate}        fragment KNeighborsClassifierFragment on KNeighborsClassifierHyperparameters {  nNeighbors}        fragment RandomForestRegressionFragment on RandomForestRegressionHyperparameters {  minSamplesSplit  maxDepth  minSamplesLeaf  nEstimators  maxFeatures}        fragment XGBRegressionFragment on XGBRegressionHyperparameters {  maxDepth  gamma  nEstimators  minChildWeight  subsample  learningRate}        fragment SGDRegressionFragment on SGDRegressionHyperparameters {  eta0  alpha  epsilon}        fragment LassoFragment on LassoHyperparameters {  alpha  maxIter  selection  tol}        fragment LassoRegressionFragment on LassoRegressionHyperparameters {  c  penalty}        fragment CatboostRegressionHyperparametersFragment on CatBoostRegressionHyperparameters {  iterations  learningRate  depth  minDataInLeaf  l2LeafReg}        fragment CatboostClassifierHyperparametersFragment on CatBoostClassifierHyperparameters {  iterations  learningRate  depth  minDataInLeaf  l2LeafReg}        fragment LGBMClassifierFragment on LGBMClassifierHyperparameters {  numLeaves  regAlpha  learningRate  maxDepth  minChildSamples}        fragment LGBMRegressionFragment on LGBMRegressionHyperparameters {  numLeaves  regAlpha  learningRate  maxDepth  minChildSamples}    ',
      variables: {
        id,
      },
    }),
  });
  const json = await response.json();
  const features = json.data.model.schema.columns.map((d: FeatureRequest) => ({
    type: d.dtype === 'numeric' ? 'Numeric' : 'Categorical',
    name: d.name,
    expression: '',
  }));
  return {
    features,
    experimentVersionId: json.data.model.info.experimentVersionId,
  };
};

export const getTarget = async (id: string) => {
  const csrfToken = await getCsrfToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (csrfToken) {
    headers['qlik-csrf-token'] = csrfToken;
  }
  const response = await fetch('../api/v1/automl/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      operationName: 'ExperimentVersion',
      query:
        'query ExperimentVersion($id: String!) {  experimentVersion(id: $id) {    info {      ...ExperimentVersionFragment    }    profiles {      ...DataSetProfileFragment    }  }}        fragment ExperimentVersionFragment on ExperimentVersion {  id  versionNumber  name  createdAt  updatedAt  deletedAt  createdByUserId  columns  pipeline {    transforms {      column {        name        changeType      }    }  }  enableHpo  experimentId  datasetId  status  errorMessage  target  datasetSrc  experimentType  algorithms  topModelId  lastBatchNum  hpoDuration}        fragment DataSetProfileFragment on DataSetProfile {  meta {    dataSetId    status  }  profiles {    name    numberOfRows    sizeInBytes    fieldProfiles {      name      dataType      index      distinctValueCount      numericValueCount      nullValueCount      textValueCount      negativeValueCount      positiveValueCount      zeroValueCount      sumNumericValues      sumSquaredNumericValues      average      median      standardDeviation      minNumericValue      maxNumericValue      firstSortedStringValue      lastSortedStringValue      skewness      kurtosis      emptyStringCount      maxStringLength      minStringLength      sumStringLength      averageStringLength      fractiles      tags      sampleValues      mostFrequentValues {        value        frequency      }      frequencyDistribution {        binEdge        frequency      }    }  }  samples {    name    fieldNames    records {      values    }  }}',
      variables: {
        id,
      },
    }),
  });
  const json = await response.json();
  return {
    field: json.data.experimentVersion.info.target,
    type: json.data.experimentVersion.info.experimentType,
  };
};

export const getBinaryReturnFields = async (id: string, target: string): Promise<string[]> => {
  const csrfToken = await getCsrfToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (csrfToken) {
    headers['qlik-csrf-token'] = csrfToken;
  }
  const response = await fetch('../api/v1/automl/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      operationName: 'M',
      query: `query M {\n                        model(id: "${id}") {\n                        charts {\n                            binary {\n                            categoryBinResults {\n                                category\n                                source\n                            }\n                            }\n                        }\n                        }\n                    }\n            `,
      variables: {
        id,
      },
    }),
  });
  const json = await response.json();
  return Array.from(
    new Set(
      json.data.model.charts.binary.categoryBinResults.map((item: { category: string }) => `${target}_${item.category}`)
    )
  );
};

export const getMultiClassReturnFields = async (id: string, target: string): Promise<string[]> => {
  const csrfToken = await getCsrfToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (csrfToken) {
    headers['qlik-csrf-token'] = csrfToken;
  }
  const response = await fetch('../api/v1/automl/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      operationName: 'ModelCharts',
      query: `query ModelCharts($id: String!) {   model(id: $id) {     charts {       multiclass {         shapImportanceChart {           importanceDictClass {             className           }         }       }     }   } }`,
      variables: {
        id,
      },
    }),
  });
  const json = await response.json();
  return Array.from(
    new Set(
      json.data.model.charts.multiclass.shapImportanceChart.importanceDictClass.map(
        (item: { className: string }) => `${target}_${item.className}`
      )
    )
  );
};

export const getFields = async (app: Doc) => {
  const fields = await app.evaluateEx(`Concat(distinct $Field, ',')`);
  return fields && fields.qText ? fields.qText.split(',') : [];
};
