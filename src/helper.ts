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

export const getAutoMLModels = async () => {
  const csrfToken = await getCsrfToken();
  const response = await fetch('../api/dcaas/command?name=getInputOptions&dataSourceId=mlautoml&sessionId=00000000-0000-0000-0000-000000000000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'qlik-csrf-token': csrfToken || '',
    },
    body: JSON.stringify([
      "[]",
      "automlModels",
      null,
      "{\"propertiesList\":[{\"name\":\"sourceType\",\"value\":\"mlautoml\"},{\"name\":\"variant\",\"value\":\"mlautoml\"},{\"name\":\"deploymentId\",\"value\":\"\"},{\"name\":\"response.table.name\",\"value\":\"AutoML Predictions\"},{\"name\":\"includeshap\",\"value\":false},{\"name\":\"includesource\",\"value\":false},{\"name\":\"includeerrors\",\"value\":false},{\"name\":\"associationfield\",\"value\":\"\"}],\"sourceConfigurationSelectionPropertiesList\":[{\"dependencyIndex\":0,\"description\":\"The data source used to connect\",\"displayName\":\"sourceType\",\"emit\":0,\"groupName\":\"\",\"inputOptions\":{\"collectionProperty\":\"\",\"isStaticCollection\":true,\"items\":[{\"name\":\"PostgreSql (JDBC)\",\"value\":\"jdbc_postgres\"},{\"name\":\"Cassandra (JDBC)\",\"value\":\"jdbc_cassandra\"},{\"name\":\"SAP Hana (JDBC)\",\"value\":\"jdbc_sap\"},{\"name\":\"DynamoDb (JDBC)\",\"value\":\"jdbc_dynamo\"},{\"name\":\"Marketo (JDBC)\",\"value\":\"jdbc_marketo\"},{\"name\":\"Couchbase (JDBC)\",\"value\":\"jdbc_couchbase\"},{\"name\":\"DataRobot\",\"value\":\"mldatarobot\"},{\"name\":\"Azure ML\",\"value\":\"azureml\"},{\"name\":\"Advanced Analytics\",\"value\":\"mlgeneric\"},{\"name\":\"Amazon SageMaker\",\"value\":\"mlsagemaker\"},{\"name\":\"Amazon Comprehend\",\"value\":\"mlcomprehend\"},{\"name\":\"Qlik AutoML\",\"value\":\"mlautoml\"},{\"name\":\"Databricks MLflow\",\"value\":\"mldatabricks\"},{\"name\":\"OpenAI\",\"value\":\"mlopenai\"},{\"name\":\"Azure OpenAI\",\"value\":\"mlopenaiazure\"},{\"name\":\"Hugging Face\",\"value\":\"mlhf\"},{\"name\":\"Amazon Titan (Amazon Bedrock)\",\"value\":\"mlawsbedrockamazontitan\"},{\"name\":\"AI21 Labs (Amazon Bedrock)\",\"value\":\"mlawsbedrockai21\"},{\"name\":\"Anthropic (Amazon Bedrock)\",\"value\":\"mlawsbedrockanthropic\"},{\"name\":\"Cohere (Amazon Bedrock)\",\"value\":\"mlawsbedrockcohere\"},{\"name\":\"Meta (Amazon Bedrock)\",\"value\":\"mlawsbedrockmeta\"},{\"name\":\"Apache Hive (via Direct Access gateway)\",\"value\":\"DG_apache-hive\"},{\"name\":\"Apache Phoenix (via Direct Access gateway)\",\"value\":\"DG_apache-phoenix\"},{\"name\":\"Apache Spark (via Direct Access gateway)\",\"value\":\"DG_apache-spark\"},{\"name\":\"Amazon Athena (via Direct Access gateway)\",\"value\":\"DG_athena\"},{\"name\":\"Azure SQL Database (via Direct Access gateway)\",\"value\":\"DG_azure_sql\"},{\"name\":\"Azure Synapse Analytics (via Direct Access gateway)\",\"value\":\"DG_azure-synapse\"},{\"name\":\"Databricks (via Direct Access gateway)\",\"value\":\"DG_databricks\"},{\"name\":\"Apache Drill (via Direct Access gateway)\",\"value\":\"DG_drill\"},{\"name\":\"File (via Direct Access gateway)\",\"value\":\"DG_File_local\"},{\"name\":\"Google BigQuery (via Direct Access gateway)\",\"value\":\"DG_gbq\"},{\"name\":\"ODBC (via Direct Access gateway)\",\"value\":\"DG_GenericDriver\"},{\"name\":\"Cloudera Impala (via Direct Access gateway)\",\"value\":\"DG_impala\"},{\"name\":\"MongoDB (via Direct Access gateway)\",\"value\":\"DG_mongo\"},{\"name\":\"Microsoft SQL Server (via Direct Access gateway)\",\"value\":\"DG_mssql\"},{\"name\":\"MySQL Enterprise Edition (via Direct Access gateway)\",\"value\":\"DG_mysql\"},{\"name\":\"Oracle (via Direct Access gateway)\",\"value\":\"DG_oracle\"},{\"name\":\"PostgreSQL (via Direct Access gateway)\",\"value\":\"DG_postgres\"},{\"name\":\"Presto (via Direct Access gateway)\",\"value\":\"DG_presto\"},{\"name\":\"Amazon Redshift (via Direct Access gateway)\",\"value\":\"DG_redshift\"},{\"name\":\"SAP BW (via Direct Access gateway)\",\"value\":\"DG_sap-bw\"},{\"name\":\"SAP ODP (via Direct Access gateway)\",\"value\":\"DG_sap-odp\"},{\"name\":\"SAP SQL (via Direct Access gateway)\",\"value\":\"DG_sap-sql\"},{\"name\":\"ServiceNow (via Direct Access gateway)\",\"value\":\"DG_servicenow\"},{\"name\":\"Snowflake (via Direct Access gateway)\",\"value\":\"DG_snowflake\"},{\"name\":\"Teradata (via Direct Access gateway)\",\"value\":\"DG_teradata\"},{\"name\":\"MySQL\",\"value\":\"repsrc_mysql\"},{\"name\":\"PostgreSQL\",\"value\":\"repsrc_postgresql\"},{\"name\":\"Microsoft SQL Server (Microsoft CDC based)\",\"value\":\"repsrc_azuresqlmscdc\"},{\"name\":\"Microsoft SQL Server (log based)\",\"value\":\"repsrc_mssql\"},{\"name\":\"Oracle\",\"value\":\"repsrc_oracle\"},{\"name\":\"SAP HANA (Database)\",\"value\":\"repsrc_saphana\"},{\"name\":\"SAP Extractor\",\"value\":\"repsrc_sapextractor\"},{\"name\":\"SAP (Application)\",\"value\":\"repsrc_sapdbapplication\"},{\"name\":\"SAP HANA (Application)\",\"value\":\"repsrc_sapapplication\"},{\"name\":\"SAP ODP\",\"value\":\"repsrc_sapodp\"},{\"name\":\"IBM DB2 for LUW\",\"value\":\"repsrc_db2luw\"},{\"name\":\"IBM DB2 for z/OS\",\"value\":\"repsrc_db2zos\"},{\"name\":\"IBM DB2 for iSeries\",\"value\":\"repsrc_db2iseries\"},{\"name\":\"Precog\",\"value\":\"external_data_provider\"},{\"name\":\"Snowflake Target\",\"value\":\"reptgt_qdisnowflake\"},{\"name\":\"Azure Data Lake Storage Target\",\"value\":\"reptgt_qdiadls\"},{\"name\":\"Azure Data Lake Storage\",\"value\":\"reptgt_adls\"},{\"name\":\"Google BigQuery Target\",\"value\":\"reptgt_qdibigquery\"},{\"name\":\"Google Cloud Storage Target\",\"value\":\"reptgt_qdigooglecloudstorage\"},{\"name\":\"Azure Synapse Analytics Target\",\"value\":\"reptgt_qdisynapse\"},{\"name\":\"Microsoft Fabric Target\",\"value\":\"reptgt_qdimicrosoftfabric\"},{\"name\":\"Databricks Target\",\"value\":\"reptgt_qdidatabricks\"},{\"name\":\"Amazon Redshift Target\",\"value\":\"reptgt_qdiredshift\"},{\"name\":\"Amazon S3 Target\",\"value\":\"reptgt_qdis3\"},{\"name\":\"Microsoft SQL Server Target\",\"value\":\"reptgt_mssqltarget\"},{\"name\":\"PostgreSQL Target\",\"value\":\"reptgt_qdipostgresql\"},{\"name\":\"MySQL Target\",\"value\":\"reptgt_qdimysql\"},{\"name\":\"Oracle Target\",\"value\":\"reptgt_qdioracle\"},{\"name\":\"\",\"value\":\"automl_dataconnector\"},{\"name\":\"Qlik GeoOperations\",\"value\":\"GEO_OPERATIONS_WIZARD\"},{\"name\":\"Qlik GeoOperations Shapefile\",\"value\":\"GEO_OPERATIONS_SHAPE\"},{\"name\":\"Qlik GeoOperations GeoJSON\",\"value\":\"GEO_OPERATIONS_GEOJSON\"}]},\"inputType\":\"select\",\"isEnabled\":true,\"isRequired\":true,\"isVisible\":true,\"maxSelections\":0,\"metadataTag\":\"\",\"name\":\"sourceType\",\"placeholder\":\"\",\"styleName\":\"\",\"value\":\"mlautoml\"}]}"
    ])
  });
  const json = await response.json();
  return json.items;
};

export const getConnectionString = async (deploymentId: string) => {
  const csrfToken = await getCsrfToken();
  const response = await fetch('../api/dcaas/command?name=getConnectionString&dataSourceId=mlautoml&sessionId=00000000-0000-0000-0000-000000000000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'qlik-csrf-token': csrfToken || '',
    },
    body: JSON.stringify([
      `{"propertiesList":[{"name":"sourceType","value":"mlautoml"},{"name":"variant","value":"mlautoml"},{"name":"deploymentId","value":"${deploymentId}"},{"name":"response.table.name","value":"AutoML Predictions"},{"name":"includeshap","value":false},{"name":"includesource","value":false},{"name":"includeerrors","value":false},{"name":"associationfield","value":""}],"sourceConfigurationSelectionPropertiesList":[{"dependencyIndex":0,"description":"The data source used to connect","displayName":"sourceType","emit":0,"groupName":"","inputOptions":{"collectionProperty":"","isStaticCollection":true,"items":[{"name":"PostgreSql (JDBC)","value":"jdbc_postgres"},{"name":"Cassandra (JDBC)","value":"jdbc_cassandra"},{"name":"SAP Hana (JDBC)","value":"jdbc_sap"},{"name":"DynamoDb (JDBC)","value":"jdbc_dynamo"},{"name":"Marketo (JDBC)","value":"jdbc_marketo"},{"name":"Couchbase (JDBC)","value":"jdbc_couchbase"},{"name":"DataRobot","value":"mldatarobot"},{"name":"Azure ML","value":"azureml"},{"name":"Advanced Analytics","value":"mlgeneric"},{"name":"Amazon SageMaker","value":"mlsagemaker"},{"name":"Amazon Comprehend","value":"mlcomprehend"},{"name":"Qlik AutoML","value":"mlautoml"},{"name":"Databricks MLflow","value":"mldatabricks"},{"name":"OpenAI","value":"mlopenai"},{"name":"Azure OpenAI","value":"mlopenaiazure"},{"name":"Hugging Face","value":"mlhf"},{"name":"Amazon Titan (Amazon Bedrock)","value":"mlawsbedrockamazontitan"},{"name":"AI21 Labs (Amazon Bedrock)","value":"mlawsbedrockai21"},{"name":"Anthropic (Amazon Bedrock)","value":"mlawsbedrockanthropic"},{"name":"Cohere (Amazon Bedrock)","value":"mlawsbedrockcohere"},{"name":"Meta (Amazon Bedrock)","value":"mlawsbedrockmeta"},{"name":"Apache Hive (via Direct Access gateway)","value":"DG_apache-hive"},{"name":"Apache Phoenix (via Direct Access gateway)","value":"DG_apache-phoenix"},{"name":"Apache Spark (via Direct Access gateway)","value":"DG_apache-spark"},{"name":"Amazon Athena (via Direct Access gateway)","value":"DG_athena"},{"name":"Azure SQL Database (via Direct Access gateway)","value":"DG_azure_sql"},{"name":"Azure Synapse Analytics (via Direct Access gateway)","value":"DG_azure-synapse"},{"name":"Databricks (via Direct Access gateway)","value":"DG_databricks"},{"name":"Apache Drill (via Direct Access gateway)","value":"DG_drill"},{"name":"File (via Direct Access gateway)","value":"DG_File_local"},{"name":"Google BigQuery (via Direct Access gateway)","value":"DG_gbq"},{"name":"ODBC (via Direct Access gateway)","value":"DG_GenericDriver"},{"name":"Cloudera Impala (via Direct Access gateway)","value":"DG_impala"},{"name":"MongoDB (via Direct Access gateway)","value":"DG_mongo"},{"name":"Microsoft SQL Server (via Direct Access gateway)","value":"DG_mssql"},{"name":"MySQL Enterprise Edition (via Direct Access gateway)","value":"DG_mysql"},{"name":"Oracle (via Direct Access gateway)","value":"DG_oracle"},{"name":"PostgreSQL (via Direct Access gateway)","value":"DG_postgres"},{"name":"Presto (via Direct Access gateway)","value":"DG_presto"},{"name":"Amazon Redshift (via Direct Access gateway)","value":"DG_redshift"},{"name":"SAP BW (via Direct Access gateway)","value":"DG_sap-bw"},{"name":"SAP ODP (via Direct Access gateway)","value":"DG_sap-odp"},{"name":"SAP SQL (via Direct Access gateway)","value":"DG_sap-sql"},{"name":"ServiceNow (via Direct Access gateway)","value":"DG_servicenow"},{"name":"Snowflake (via Direct Access gateway)","value":"DG_snowflake"},{"name":"Teradata (via Direct Access gateway)","value":"DG_teradata"},{"name":"MySQL","value":"repsrc_mysql"},{"name":"PostgreSQL","value":"repsrc_postgresql"},{"name":"Microsoft SQL Server (Microsoft CDC based)","value":"repsrc_azuresqlmscdc"},{"name":"Microsoft SQL Server (log based)","value":"repsrc_mssql"},{"name":"Oracle","value":"repsrc_oracle"},{"name":"SAP HANA (Database)","value":"repsrc_saphana"},{"name":"SAP Extractor","value":"repsrc_sapextractor"},{"name":"SAP (Application)","value":"repsrc_sapdbapplication"},{"name":"SAP HANA (Application)","value":"repsrc_sapapplication"},{"name":"SAP ODP","value":"repsrc_sapodp"},{"name":"IBM DB2 for LUW","value":"repsrc_db2luw"},{"name":"IBM DB2 for z/OS","value":"repsrc_db2zos"},{"name":"IBM DB2 for iSeries","value":"repsrc_db2iseries"},{"name":"Precog","value":"external_data_provider"},{"name":"Snowflake Target","value":"reptgt_qdisnowflake"},{"name":"Azure Data Lake Storage Target","value":"reptgt_qdiadls"},{"name":"Azure Data Lake Storage","value":"reptgt_adls"},{"name":"Google BigQuery Target","value":"reptgt_qdibigquery"},{"name":"Google Cloud Storage Target","value":"reptgt_qdigooglecloudstorage"},{"name":"Azure Synapse Analytics Target","value":"reptgt_qdisynapse"},{"name":"Microsoft Fabric Target","value":"reptgt_qdimicrosoftfabric"},{"name":"Databricks Target","value":"reptgt_qdidatabricks"},{"name":"Amazon Redshift Target","value":"reptgt_qdiredshift"},{"name":"Amazon S3 Target","value":"reptgt_qdis3"},{"name":"Microsoft SQL Server Target","value":"reptgt_mssqltarget"},{"name":"PostgreSQL Target","value":"reptgt_qdipostgresql"},{"name":"MySQL Target","value":"reptgt_qdimysql"},{"name":"Oracle Target","value":"reptgt_qdioracle"},{"name":"","value":"automl_dataconnector"},{"name":"Qlik GeoOperations","value":"GEO_OPERATIONS_WIZARD"},{"name":"Qlik GeoOperations Shapefile","value":"GEO_OPERATIONS_SHAPE"},{"name":"Qlik GeoOperations GeoJSON","value":"GEO_OPERATIONS_GEOJSON"}]},"inputType":"select","isEnabled":true,"isRequired":true,"isVisible":true,"maxSelections":0,"metadataTag":"","name":"sourceType","placeholder":"","styleName":"","value":"mlautoml"}]}`,
      "",
      "[]"
    ])
  });
  const json = await response.json();
  return json.connectionString;
};

export const createDataConnection = async (connectionString: string, name: string, space: string) => {
  const csrfToken = await getCsrfToken();
  const response = await fetch('../api/v1/data-connections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'qlik-csrf-token': csrfToken || '',
    },
    body: JSON.stringify({
      datasourceID: "mlautoml",
      qConnectStatement: connectionString,
      qUsername: null,
      qPassword: "",
      qLogOn: 1,
      qName: name,
      qType: "QlikConnectorsCommonService.exe",
      space: space
    })
  });
  return response.json();
};

export const getSpaces = async () => {
  const response = await fetch('../api/v1/spaces');
  const json = await response.json();
  return json.data.map((space: any) => ({
    id: space.id,
    name: space.name
  }));
};