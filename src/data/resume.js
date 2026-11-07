// Single source of truth for all portfolio copy. The UI and the SQL console both read from here.
import { NODES, RUN_ORDER } from './orderPlatform'

export const profile = {
  name: 'Narayana Rongali',
  role: 'Senior Data Engineer',
  email: 'rongalisssnarayana@gmail.com',
  linkedin: 'https://www.linkedin.com/in/narayanarongali/',
  // Add your GitHub profile URL here and a link appears in the hero and contact sections.
  github: 'https://github.com/narayana-rongali',
  // Set to null to hide every resume link.
  resumeUrl: `${import.meta.env.BASE_URL}Narayana_Rongali_Resume.pdf`,
}

export const heroStats = [
  { value: '1.2M+', label: 'Store-item records processed daily' },
  { value: '~4 hrs → <20 min', label: 'Order cycle across 5 retailers' },
  { value: '~80%', label: 'Faster nightly Spark run' },
  { value: '~35%', label: 'Lower cluster cost' },
]

export const workflowHighlights = [
  { value: '5', label: 'national retailers on one platform' },
  { value: '85%', label: 'fewer duplicate and malformed records' },
  { value: '45%', label: 'fewer downstream incidents' },
  { value: '~2 weeks → 3 days', label: 'to onboard a retailer' },
]

export const production = [
  {
    practice: 'Incremental loads',
    how: 'Watermarks, Delta MERGE upserts and Auto Loader schema evolution, instead of reprocessing everything.',
    result: '85% fewer bad records',
  },
  {
    practice: 'Orchestration',
    how: 'Dependency-aware Airflow DAGs with retries, SLAs and backfills across ingestion, transforms and quality gates.',
    result: 'Failed checks block orders',
  },
  {
    practice: 'Data quality',
    how: 'A PySpark framework for nulls, ranges, referential integrity and reconciliation over 25+ tables, with Azure Monitor alerting.',
    result: '45% fewer incidents',
  },
  {
    practice: 'Performance and cost',
    how: 'Salting, broadcast joins and AQE for skew. Partitioning, OPTIMIZE and Z-ORDER for file layout. Snowflake query and warehouse tuning.',
    result: '~80% faster, ~35% cheaper',
  },
  {
    practice: 'Workload isolation',
    how: 'ADLS Gen2 and Delta for batch, a star schema for Power BI, and Couchbase for real-time write-backs from a field app on AKS.',
    result: 'Analytics and operations separated',
  },
  {
    practice: 'Release and security',
    how: 'Azure DevOps and ARM templates for automated releases, with secrets in Key Vault.',
    result: '50% less release time',
  },
]

export const experience = [
  {
    company: 'LatentView Analytics',
    role: 'Senior Analyst, Data Engineering',
    period: 'Sep 2023 to Present',
    groups: [
      {
        title: 'Snack and beverage',
        items: [
          "Built an automated order-generation and forecasting platform for 5 retailers on ADF and Databricks, processing 1.2M+ store-item records daily and cutting the order cycle from ~4 hrs to under 20 min.",
          'Designed the layered architecture: Delta medallion for batch, a star schema for Power BI, and Couchbase for real-time write-backs.',
          'Modelled a store-item-day star schema with conformed dimensions and SCD Type 2, improving Power BI query time by 55%.',
          'Migrated the platform and on-premises SQL Server 2019 workloads to AWS, cutting the key forecast procedure from ~45 to 6 min.',
          'Built metadata-driven ADF pipelines, including SHIR-based API ingestion, taking retailer onboarding from ~2 weeks to 3 days.',
        ],
      },
      {
        title: 'Adobe',
        items: [
          'Supported ETL pipelines loading business data into reporting tables, and wrote and tuned the SQL transformations.',
          'Ran data quality checks, resolved pipeline failures, and documented pipeline logic and data definitions.',
        ],
      },
    ],
  },
]

// Set this once the POC repository is on GitHub, and each POC card links to its folder.
export const POC_REPO = 'https://github.com/narayana-rongali/data-engineering-pocs'

// Every POC below has code and passing tests. `proof` says exactly what has been run.
export const pocs = [
  {
    id: 'kafka-cdc',
    folder: '01-cdc-debezium-kafka-delta',
    title: 'CDC with Debezium and Kafka',
    goal: 'Stream row-level SQL Server changes into Delta, without waiting for a nightly batch.',
    approach: [
      'Debezium reads SQL Server change tables and publishes each row change to Kafka.',
      'A consumer keeps the last change per key and applies it with Delta MERGE, committing offsets only after the merge.',
    ],
    flow: ['SQL Server', 'Debezium', 'Kafka', 'Consumer', 'Delta MERGE'],
    skills: ['Kafka', 'Debezium', 'Delta Lake', 'Docker'],
    proof: '12 unit tests, plus an end-to-end Docker test in CI',
  },
  {
    id: 'kafka-adf',
    folder: '02-kafka-to-adf-event-driven',
    title: 'Kafka to ADF, event-driven',
    goal: 'Start ADF pipelines when data arrives, instead of on a fixed schedule.',
    approach: [
      'A sink writes finished, offset-named files to ADLS Gen2, so replays never duplicate.',
      'An ADF storage event trigger runs a Databricks notebook that MERGEs each file.',
    ],
    flow: ['Kafka', 'Sink', 'ADLS Gen2', 'ADF event trigger', 'Databricks'],
    skills: ['Kafka', 'Azure Data Factory', 'ADLS Gen2', 'ARM templates'],
    proof: '8 tests, including trigger-to-writer contract tests',
  },
  {
    id: 'iceberg',
    folder: '03-iceberg-vs-delta',
    title: 'Iceberg and Delta side by side',
    goal: 'Run the same workload on both table formats and record what actually happens.',
    approach: [
      '5 million rows across 5 daily partitions in each format.',
      'Compares partition-filtered reads, time travel, schema evolution and storage size.',
    ],
    flow: ['Synthetic orders', 'Iceberg and Delta', 'Benchmark'],
    skills: ['Apache Iceberg', 'Delta Lake', 'PyArrow'],
    proof: 'Benchmark results committed, 8 tests',
  },
  {
    id: 'metadata-adf',
    folder: '04-metadata-driven-adf',
    title: 'Metadata-driven ADF ingestion',
    goal: 'One pipeline for any number of sources, where onboarding a source is configuration.',
    approach: [
      'Lookup reads a control table, ForEach copies each increment, and the watermark advances only after success.',
      'Validated metadata blocks SQL injection and unsafe lake paths.',
    ],
    flow: ['Control table', 'Lookup', 'ForEach', 'Copy', 'Watermark'],
    skills: ['Azure Data Factory', 'Azure SQL', 'ARM templates'],
    proof: '11 tests, with the watermark logic run on SQLite',
  },
  {
    id: 'aws-ingest',
    folder: '05-aws-s3-lambda-glue',
    title: 'S3, Lambda and Glue ingestion',
    goal: 'Validate landing files, quarantine bad rows, and make new data queryable straight away.',
    approach: [
      'An S3-triggered Lambda splits clean and bad rows and registers the Glue partition idempotently.',
      'Least-privilege IAM, and Terraform for the whole stack.',
    ],
    flow: ['S3 landing', 'Lambda', 'Curated and quarantine', 'Glue Catalog'],
    skills: ['S3', 'Lambda', 'Glue', 'IAM', 'Terraform'],
    proof: '9 tests on moto, terraform validate in CI',
  },
  {
    id: 'snowflake',
    folder: '06-snowflake-optimization',
    title: 'Snowflake optimization toolkit',
    goal: 'Find where Snowflake time and credits go, and what to change.',
    approach: [
      'SQL for costly query patterns, poor pruning, spill, queueing, credits and clustering health.',
      'An advisor that ranks query patterns from a QUERY_HISTORY export, with a fix for each issue.',
    ],
    flow: ['QUERY_HISTORY', 'Advisor', 'Ranked fixes'],
    skills: ['Snowflake', 'SQL', 'Cost optimization'],
    proof: '15 tests on synthetic history, SQL syntax-checked',
  },
  {
    id: 'rag',
    title: 'Multi-modal RAG',
    goal: 'Retrieval-augmented generation across multiple modalities.',
    approach: ['LangChain orchestrates the chain.', 'ChromaDB is the vector store.'],
    flow: ['Multi-modal data', 'ChromaDB', 'LangChain', 'Answer'],
    skills: ['LangChain', 'ChromaDB', 'RAG', 'Python'],
  },
]

// Production is client work from the resume. POC is the tested code above.
export const cloudServices = [
  {
    platform: 'Azure',
    services: [
      { name: 'Data Factory', use: 'Metadata-driven pipelines, SHIR API ingestion, storage event triggers', where: ['Production', 'POC'] },
      { name: 'Databricks', use: 'Delta medallion transforms, Auto Loader, MERGE upserts', where: ['Production', 'POC'] },
      { name: 'ADLS Gen2', use: 'Lake storage for the medallion layers and event-driven landing', where: ['Production', 'POC'] },
      { name: 'Key Vault', use: 'Secrets for automated releases', where: ['Production'] },
      { name: 'Monitor', use: 'Alerting on data quality failures', where: ['Production'] },
      { name: 'AKS', use: 'Hosting the field app that writes back orders', where: ['Production'] },
      { name: 'DevOps', use: 'CI/CD with ARM templates', where: ['Production'] },
      { name: 'Azure SQL', use: 'Control table for metadata-driven ingestion', where: ['POC'] },
    ],
  },
  {
    platform: 'AWS',
    services: [
      { name: 'S3', use: 'Platform migration target, and landing, curated and quarantine zones', where: ['Production', 'POC'] },
      { name: 'EC2', use: 'Compute for the migrated platform', where: ['Production'] },
      { name: 'IAM', use: 'Access for the migrated platform, and least-privilege Lambda roles', where: ['Production', 'POC'] },
      { name: 'Lambda', use: 'S3-triggered validation and routing', where: ['POC'] },
      { name: 'Glue Data Catalog', use: 'Idempotent partition registration', where: ['POC'] },
    ],
  },
]

export const snowflakeWork = {
  production:
    'Optimised Snowflake queries and warehouse usage to lower runtime and credit consumption: query profile analysis, partition pruning, clustering keys, warehouse sizing and result caching.',
  techniques: [
    { name: 'Query profile analysis', what: 'Find the operator where time actually goes before changing anything.' },
    { name: 'Partition pruning', what: 'Filter on columns the micro-partitions are organised by, so less data is read.' },
    { name: 'Clustering keys', what: 'Cluster large tables on what queries filter by, checked with clustering depth first.' },
    { name: 'Warehouse sizing', what: 'Size for spill and queueing, not habit. Bigger only when the data really needs it.' },
    { name: 'Result caching', what: 'Let repeated dashboard queries come from the result cache instead of recomputing.' },
    { name: 'Cost guardrails', what: 'Auto-suspend, statement timeouts and resource monitors.', poc: true },
  ],
}

export const skillGroups = [
  { name: 'Languages', family: 'language', skills: ['SQL (T-SQL)', 'Python', 'PySpark', 'pandas'] },
  {
    name: 'Processing',
    family: 'processing',
    skills: ['Databricks', 'Delta Lake', 'Auto Loader', 'Kafka', 'Debezium (CDC)', 'Apache Iceberg'],
  },
  { name: 'Orchestration', family: 'orchestration', skills: ['Azure Data Factory', 'Airflow', 'AWS Glue'] },
  {
    name: 'Data stores',
    family: 'database',
    skills: ['Snowflake', 'SQL Server', 'Azure SQL', 'Synapse', 'Redshift', 'Couchbase', 'Teradata', 'IBM DB2', 'MySQL'],
  },
  {
    name: 'Azure',
    family: 'azure',
    skills: ['ADLS Gen2', 'Key Vault', 'Monitor', 'AKS'],
  },
  { name: 'AWS', family: 'aws', skills: ['S3', 'EC2', 'IAM'] },
  { name: 'DevOps', family: 'devops', skills: ['Azure DevOps CI/CD', 'ARM templates', 'Git'] },
  {
    name: 'Modelling',
    family: 'modelling',
    skills: ['Star schema', 'Conformed dimensions', 'SCD Type 2', 'Medallion architecture', 'Incremental/CDC loads'],
  },
  {
    name: 'BI and quality',
    family: 'bi',
    skills: ['Power BI', 'DAX', 'Data quality frameworks', 'Reconciliation', 'Root cause analysis', 'Spark and Snowflake tuning'],
  },
  { name: 'Generative AI', family: 'genai', skills: ['LangChain', 'ChromaDB', 'RAG'] },
]

export const credentials = [
  { kind: 'Certification', title: 'Databricks Certified Data Engineer Professional', meta: '2026' },
  { kind: 'Certification', title: 'Databricks Certified Generative AI Engineer Associate', meta: '2026' },
  {
    kind: 'Award',
    title: 'Spot Award',
    meta: 'LatentView Analytics',
    text: 'Going above and beyond.',
  },
  {
    kind: 'Award',
    title: 'Encore Award',
    meta: 'LatentView Analytics',
    text: 'Excellence in customer centricity.',
  },
]

// The warehouse behind the SQL console.
export const warehouse = {
  order_platform: RUN_ORDER.map((id, index) => ({
    step: index + 1,
    stage: NODES[id].title,
    lane: NODES[id].lane,
    result: NODES[id].metric ? `${NODES[id].metric.value} ${NODES[id].metric.label}` : null,
  })),
  production: production.map(({ practice, how, result }) => ({ practice, how, result })),
  experience: experience.map(({ company, role, period }) => ({ company, role, period })),
  achievements: [
    { metric: 'nightly_spark_runtime_cut_pct', value: 80, how: 'skew fixes and file layout' },
    { metric: 'duplicate_malformed_records_cut_pct', value: 85, how: 'CDC-style loads, reconciliation' },
    { metric: 'manual_reporting_cut_pct', value: 70, how: 'automated Power BI refresh' },
    { metric: 'power_bi_query_time_gain_pct', value: 55, how: 'store-item-day star schema' },
    { metric: 'release_time_cut_pct', value: 50, how: 'Azure DevOps and ARM templates' },
    { metric: 'downstream_incidents_cut_pct', value: 45, how: 'PySpark data quality framework' },
    { metric: 'cluster_cost_cut_pct', value: 35, how: 'Spark tuning' },
  ],
  pocs: pocs.map(({ title, skills, proof }) => ({ title, skills: skills.join(', '), proof: proof ?? null })),
  cloud_services: cloudServices.flatMap(({ platform, services }) =>
    services.map(({ name, use, where }) => ({ platform, service: name, use, used_in: where.join(', ') })),
  ),
  skills: skillGroups.flatMap(({ family, skills }) => skills.map((name) => ({ name, family }))),
  credentials: credentials.map(({ kind, title, meta }) => ({ kind, title, detail: meta })),
}

export const presetQueries = [
  { label: 'Impact', sql: 'SELECT metric, value, how\nFROM achievements\nORDER BY value DESC;' },
  { label: 'Platform run', sql: 'SELECT step, stage, result\nFROM order_platform\nORDER BY step;' },
  { label: 'AWS services', sql: "SELECT service, use, used_in\nFROM cloud_services\nWHERE platform = 'AWS';" },
  { label: 'Stack size', sql: 'SELECT family, COUNT(*) AS tools\nFROM skills\nGROUP BY family\nORDER BY tools DESC;' },
  { label: 'Tables', sql: 'SHOW TABLES;' },
]
