// The order-generation platform as a graph. Every fact comes from the resume; the client is anonymized.
// The order of the arrows between stages is inferred, so correct `EDGES` if the real flow differs.

export const CLIENT = 'a Fortune 500 snack and beverage company'

const W = 140
const H = 56
const COL = (c) => c * 170
const TOP = 0
const BATCH = 96
const MID = 200
const LOW = 304

export const NODES = {
  airflow: {
    title: 'Airflow orchestration',
    tag: 'Dependency-aware DAGs',
    lane: 'control',
    box: { x: COL(1), y: TOP, w: 650, h: 44 },
    what: 'Airflow DAGs run ingestion, Databricks transforms and data quality gates in dependency order.',
    how: [
      'Tasks only start once the work they depend on has succeeded.',
      'Retries, SLAs and backfills are defined on the DAGs.',
      'A failed quality check blocks downstream order generation.',
    ],
    tools: ['Apache Airflow', 'Databricks'],
  },
  retailers: {
    title: 'Retailer data',
    tag: '5 retailers',
    lane: 'batch',
    box: { x: COL(0), y: BATCH, w: W, h: H },
    what: 'Store-item data from 5 national retailers feeds the platform.',
    how: ['More than 1.2M store-item records are processed every day.', 'Each retailer arrives through the same ingestion framework.'],
    tools: ['5 retailer feeds'],
    metric: { value: '1.2M+', label: 'store-item records daily' },
  },
  adf: {
    title: 'ADF ingestion',
    tag: 'Metadata-driven',
    lane: 'batch',
    box: { x: COL(1), y: BATCH, w: W, h: H },
    what: 'Metadata-driven Azure Data Factory pipelines bring each retailer into the lake.',
    how: [
      'Pipelines take their behaviour from metadata, so a new retailer is mostly configuration.',
      'A Self-hosted Integration Runtime (SHIR) handles API ingestion.',
      'Watermarks keep each load incremental.',
    ],
    tools: ['Azure Data Factory', 'SHIR', 'Watermarks'],
    metric: { value: '~2 weeks → 3 days', label: 'retailer onboarding' },
  },
  bronze: {
    title: 'Bronze',
    tag: 'ADLS Gen2 + Delta',
    lane: 'batch',
    box: { x: COL(2), y: BATCH, w: W, h: H },
    what: 'The first medallion layer holds incoming data in Delta on ADLS Gen2.',
    how: ['Auto Loader picks up new data.', 'Schema evolution absorbs source changes as they arrive.'],
    tools: ['ADLS Gen2', 'Delta Lake', 'Auto Loader'],
  },
  silver: {
    title: 'Silver',
    tag: 'Incremental MERGE',
    lane: 'batch',
    box: { x: COL(3), y: BATCH, w: W, h: H },
    what: 'Incremental, CDC-style loads keep the conformed layer current without full reloads.',
    how: ['Watermarks limit each run to changed data.', 'Delta MERGE applies the changes as upserts.', 'PySpark on Databricks runs the transforms.'],
    tools: ['Databricks', 'PySpark', 'Delta MERGE'],
  },
  dq: {
    title: 'Data quality gate',
    tag: '25+ tables checked',
    lane: 'gate',
    box: { x: COL(4), y: BATCH, w: W, h: H },
    what: 'A PySpark data quality framework checks the data before anything downstream can use it.',
    how: [
      'Checks cover nulls, ranges, referential integrity and reconciliation.',
      'Azure Monitor raises an alert when a check fails.',
      'A failure stops the run here, so bad data never reaches an order.',
    ],
    tools: ['PySpark', 'Azure Monitor'],
    metric: { value: '45%', label: 'fewer downstream incidents' },
  },
  gold: {
    title: 'Gold star schema',
    tag: 'Store-item-day grain',
    lane: 'batch',
    box: { x: COL(5), y: BATCH, w: W, h: H },
    what: 'A dimensional serving layer modelled at store-item-day grain.',
    how: ['Conformed dimensions for store, item, retailer and date.', 'SCD Type 2 keeps dimension history.'],
    tools: ['Star schema', 'Conformed dimensions', 'SCD Type 2'],
    metric: { value: '55%', label: 'better Power BI query time' },
  },
  powerbi: {
    title: 'Power BI',
    tag: '10+ dashboards',
    lane: 'serve',
    box: { x: COL(5), y: TOP, w: W, h: H - 12 },
    what: 'Dashboards read from the star schema and refresh automatically.',
    how: ['More than 10 dashboards serve the business.', 'Automated refresh replaced manual reporting.'],
    tools: ['Power BI', 'DAX'],
    metric: { value: '70%', label: 'less manual reporting' },
  },
  sql: {
    title: 'SQL Server',
    tag: 'Forecast procedures',
    lane: 'batch',
    box: { x: COL(5), y: MID, w: W, h: H },
    what: 'Stored procedures carry forecast logic, and reconciled write-backs land here.',
    how: ['Procedures and views were rebuilt during the migration.', 'The key forecast procedure was tuned heavily.'],
    tools: ['SQL Server 2019', 'T-SQL', 'Stored procedures'],
    metric: { value: '~45 → 6 min', label: 'key forecast procedure' },
  },
  order: {
    title: 'Order generation',
    tag: 'Forecast to orders',
    lane: 'serve',
    box: { x: COL(6), y: BATCH, w: W, h: H },
    what: 'The automated step that replaced a much longer order cycle for all 5 retailers.',
    how: ['Runs on ADF and Databricks.', 'Only starts once the data quality gate has passed.'],
    tools: ['Azure Data Factory', 'Databricks'],
    metric: { value: '~4 hrs → <20 min', label: 'order cycle' },
  },
  field: {
    title: 'Field app',
    tag: 'Azure AKS',
    lane: 'operational',
    box: { x: COL(6), y: LOW, w: W, h: H },
    what: 'A field application running on Azure AKS sends order write-backs in real time.',
    how: ['Write-backs go to the operational store, never to the analytical layer.'],
    tools: ['Azure AKS'],
  },
  couchbase: {
    title: 'Couchbase',
    tag: 'Operational store',
    lane: 'operational',
    box: { x: COL(5), y: LOW, w: W, h: H },
    what: 'A NoSQL operational store takes real-time order write-backs.',
    how: ['Keeps operational traffic separate from analytical workloads, so neither slows the other.'],
    tools: ['Couchbase'],
  },
  reconcile: {
    title: 'Reconciliation',
    tag: 'To SQL Server',
    lane: 'operational',
    box: { x: COL(4), y: LOW, w: W, h: H },
    what: 'Couchbase write-backs are reconciled to SQL Server.',
    how: ['Together with the incremental loads, this removes duplicate and malformed records.'],
    tools: ['Couchbase', 'SQL Server'],
    metric: { value: '85%', label: 'fewer duplicate and malformed records' },
  },
  spark: {
    title: 'Spark performance',
    tag: '~3.5 hrs → 40 min nightly',
    lane: 'platform',
    box: { x: COL(0), y: MID, w: 310, h: H },
    what: 'Tuning work that cut the nightly Spark run and the cost of running it.',
    how: ['Fixed skew with salting, broadcast joins and AQE.', 'Fixed file layout with partitioning, OPTIMIZE and Z-ORDER.'],
    tools: ['Spark', 'AQE', 'Z-ORDER', 'OPTIMIZE'],
    metric: { value: '~80% faster', label: 'and ~35% lower cluster cost' },
  },
  snowflake: {
    title: 'Snowflake tuning',
    tag: 'Lower runtime and credits',
    lane: 'platform',
    box: { x: COL(2) - 10, y: MID, w: 310, h: H },
    what: 'Query and warehouse optimization to lower runtime and credit consumption.',
    how: ['Query profile analysis, partition pruning and clustering keys.', 'Warehouse sizing and result caching.'],
    tools: ['Snowflake'],
  },
  cicd: {
    title: 'CI/CD and secrets',
    tag: 'Release time down 50%',
    lane: 'platform',
    box: { x: COL(0), y: LOW, w: 310, h: H },
    what: 'Automated releases for the platform.',
    how: ['Azure DevOps pipelines deploy with ARM templates.', 'Key Vault holds the secrets.'],
    tools: ['Azure DevOps', 'ARM templates', 'Key Vault'],
    metric: { value: '50%', label: 'less release time' },
  },
  aws: {
    title: 'AWS migration',
    tag: 'S3, EC2, IAM',
    lane: 'platform',
    box: { x: COL(2) - 10, y: LOW, w: 310, h: H },
    what: 'The platform and on-premises SQL Server 2019 workloads moved to AWS.',
    how: ['Stored procedures and views were rebuilt along the way.', 'Runs on S3 and EC2, with access through IAM.'],
    tools: ['AWS S3', 'EC2', 'IAM', 'SQL Server 2019'],
  },
}

// [from, to, fromSide, toSide]
export const EDGES = [
  ['retailers', 'adf', 'r', 'l'],
  ['adf', 'bronze', 'r', 'l'],
  ['bronze', 'silver', 'r', 'l'],
  ['silver', 'dq', 'r', 'l'],
  ['dq', 'gold', 'r', 'l'],
  ['gold', 'order', 'r', 'l'],
  ['gold', 'powerbi', 't', 'b'],
  ['sql', 'order', 'r', 'b'],
  ['order', 'field', 'b', 't'],
  ['field', 'couchbase', 'l', 'r'],
  ['couchbase', 'reconcile', 'l', 'r'],
  ['reconcile', 'sql', 't', 'l'],
]

// Airflow's dashed task lines.
export const CONTROL_LINKS = ['adf', 'bronze', 'silver', 'dq']

// The order a nightly run lights up in the simulation.
export const RUN_ORDER = ['airflow', 'retailers', 'adf', 'bronze', 'silver', 'dq', 'gold', 'powerbi', 'sql', 'order', 'field', 'couchbase', 'reconcile']

export const BLOCKED_ON_FAILURE = ['gold', 'powerbi', 'order']

export const PLATFORM_NODES = ['spark', 'snowflake', 'cicd', 'aws']

export const FLOW_VIEWBOX = '0 0 1160 372'
