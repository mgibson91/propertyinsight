import type { ColumnType } from "kysely";
import type { IPostgresInterval } from "postgres-interval";

export type AuthAalLevel = "aal1" | "aal2" | "aal3";

export type AuthCodeChallengeMethod = "plain" | "s256";

export type AuthFactorStatus = "unverified" | "verified";

export type AuthFactorType = "totp" | "webauthn";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>;

export type Interval = ColumnType<IPostgresInterval, IPostgresInterval | number, IPostgresInterval | number>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Numeric = ColumnType<string, number | string, number | string>;

export type PgsodiumKeyStatus = "default" | "expired" | "invalid" | "valid";

export type PgsodiumKeyType = "aead-det" | "aead-ietf" | "auth" | "generichash" | "hmacsha256" | "hmacsha512" | "kdf" | "secretbox" | "secretstream" | "shorthash" | "stream_xchacha20";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface _RealtimeExtensions {
  id: string;
  inserted_at: Timestamp;
  settings: Json | null;
  tenant_external_id: string | null;
  type: string | null;
  updated_at: Timestamp;
}

export interface _RealtimeSchemaMigrations {
  inserted_at: Timestamp | null;
  version: Int8;
}

export interface _RealtimeTenants {
  external_id: string | null;
  id: string;
  inserted_at: Timestamp;
  jwt_secret: string | null;
  max_bytes_per_second: Generated<number>;
  max_channels_per_client: Generated<number>;
  max_concurrent_users: Generated<number>;
  max_events_per_second: Generated<number>;
  max_joins_per_second: Generated<number>;
  name: string | null;
  postgres_cdc_default: Generated<string | null>;
  suspend: Generated<boolean | null>;
  updated_at: Timestamp;
}

export interface _TimescaledbCatalogChunk {
  compressed_chunk_id: number | null;
  dropped: Generated<boolean>;
  hypertable_id: number;
  id: Generated<number>;
  osm_chunk: Generated<boolean>;
  schema_name: string;
  status: Generated<number>;
  table_name: string;
}

export interface _TimescaledbCatalogChunkConstraint {
  chunk_id: number;
  constraint_name: string;
  dimension_slice_id: number | null;
  hypertable_constraint_name: string | null;
}

export interface _TimescaledbCatalogChunkCopyOperation {
  backend_pid: number;
  chunk_id: number;
  completed_stage: string;
  compress_chunk_name: string;
  delete_on_source_node: boolean;
  dest_node_name: string;
  operation_id: string;
  source_node_name: string;
  time_start: Generated<Timestamp>;
}

export interface _TimescaledbCatalogChunkDataNode {
  chunk_id: number;
  node_chunk_id: number;
  node_name: string;
}

export interface _TimescaledbCatalogChunkIndex {
  chunk_id: number;
  hypertable_id: number;
  hypertable_index_name: string;
  index_name: string;
}

export interface _TimescaledbCatalogCompressionAlgorithm {
  description: string | null;
  id: number;
  name: string;
  version: number;
}

export interface _TimescaledbCatalogCompressionChunkSize {
  chunk_id: number;
  compressed_chunk_id: number;
  compressed_heap_size: Int8;
  compressed_index_size: Int8;
  compressed_toast_size: Int8;
  numrows_post_compression: Int8 | null;
  numrows_pre_compression: Int8 | null;
  uncompressed_heap_size: Int8;
  uncompressed_index_size: Int8;
  uncompressed_toast_size: Int8;
}

export interface _TimescaledbCatalogContinuousAgg {
  bucket_width: Int8;
  direct_view_name: string;
  direct_view_schema: string;
  finalized: Generated<boolean>;
  mat_hypertable_id: number;
  materialized_only: Generated<boolean>;
  parent_mat_hypertable_id: number | null;
  partial_view_name: string;
  partial_view_schema: string;
  raw_hypertable_id: number;
  user_view_name: string;
  user_view_schema: string;
}

export interface _TimescaledbCatalogContinuousAggMigratePlan {
  end_ts: Timestamp | null;
  mat_hypertable_id: number;
  start_ts: Generated<Timestamp>;
}

export interface _TimescaledbCatalogContinuousAggMigratePlanStep {
  config: Json | null;
  end_ts: Timestamp | null;
  mat_hypertable_id: number;
  start_ts: Timestamp | null;
  status: Generated<string>;
  step_id: Generated<number>;
  type: string;
}

export interface _TimescaledbCatalogContinuousAggsBucketFunction {
  bucket_width: string;
  experimental: boolean;
  mat_hypertable_id: number;
  name: string;
  origin: string;
  timezone: string;
}

export interface _TimescaledbCatalogContinuousAggsHypertableInvalidationLog {
  greatest_modified_value: Int8;
  hypertable_id: number;
  lowest_modified_value: Int8;
}

export interface _TimescaledbCatalogContinuousAggsInvalidationThreshold {
  hypertable_id: number;
  watermark: Int8;
}

export interface _TimescaledbCatalogContinuousAggsMaterializationInvalidationLog {
  greatest_modified_value: Int8;
  lowest_modified_value: Int8;
  materialization_id: number | null;
}

export interface _TimescaledbCatalogDimension {
  aligned: boolean;
  column_name: string;
  column_type: string;
  compress_interval_length: Int8 | null;
  hypertable_id: number;
  id: Generated<number>;
  integer_now_func: string | null;
  integer_now_func_schema: string | null;
  interval_length: Int8 | null;
  num_slices: number | null;
  partitioning_func: string | null;
  partitioning_func_schema: string | null;
}

export interface _TimescaledbCatalogDimensionPartition {
  data_nodes: string[] | null;
  dimension_id: number;
  range_start: Int8;
}

export interface _TimescaledbCatalogDimensionSlice {
  dimension_id: number;
  id: Generated<number>;
  range_end: Int8;
  range_start: Int8;
}

export interface _TimescaledbCatalogHypertable {
  associated_schema_name: string;
  associated_table_prefix: string;
  chunk_sizing_func_name: string;
  chunk_sizing_func_schema: string;
  chunk_target_size: Int8;
  compressed_hypertable_id: number | null;
  compression_state: Generated<number>;
  id: Generated<number>;
  num_dimensions: number;
  replication_factor: number | null;
  schema_name: string;
  table_name: string;
}

export interface _TimescaledbCatalogHypertableCompression {
  attname: string;
  compression_algorithm_id: number | null;
  hypertable_id: number;
  orderby_asc: boolean | null;
  orderby_column_index: number | null;
  orderby_nullsfirst: boolean | null;
  segmentby_column_index: number | null;
}

export interface _TimescaledbCatalogHypertableDataNode {
  block_chunks: boolean;
  hypertable_id: number;
  node_hypertable_id: number | null;
  node_name: string;
}

export interface _TimescaledbCatalogMetadata {
  include_in_telemetry: boolean;
  key: string;
  value: string;
}

export interface _TimescaledbCatalogRemoteTxn {
  data_node_name: string | null;
  remote_transaction_id: string;
}

export interface _TimescaledbCatalogTablespace {
  hypertable_id: number;
  id: Generated<number>;
  tablespace_name: string;
}

export interface _TimescaledbConfigBgwJob {
  application_name: string;
  check_name: string | null;
  check_schema: string | null;
  config: Json | null;
  fixed_schedule: Generated<boolean>;
  hypertable_id: number | null;
  id: Generated<number>;
  initial_start: Timestamp | null;
  max_retries: number;
  max_runtime: Interval;
  owner: Generated<string>;
  proc_name: string;
  proc_schema: string;
  retry_period: Interval;
  schedule_interval: Interval;
  scheduled: Generated<boolean>;
  timezone: string | null;
}

export interface _TimescaledbInternalBgwJobStat {
  consecutive_crashes: number;
  consecutive_failures: number;
  flags: Generated<number>;
  job_id: number;
  last_finish: Timestamp;
  last_run_success: boolean;
  last_start: Generated<Timestamp>;
  last_successful_finish: Timestamp;
  next_start: Timestamp;
  total_crashes: Int8;
  total_duration: Interval;
  total_duration_failures: Interval;
  total_failures: Int8;
  total_runs: Int8;
  total_successes: Int8;
}

export interface _TimescaledbInternalBgwPolicyChunkStats {
  chunk_id: number;
  job_id: number;
  last_time_job_run: Timestamp | null;
  num_times_job_run: number | null;
}

export interface _TimescaledbInternalCompressedChunkStats {
  chunk_name: string | null;
  chunk_schema: string | null;
  compressed_heap_size: Int8 | null;
  compressed_index_size: Int8 | null;
  compressed_toast_size: Int8 | null;
  compressed_total_size: Int8 | null;
  compression_status: string | null;
  hypertable_name: string | null;
  hypertable_schema: string | null;
  uncompressed_heap_size: Int8 | null;
  uncompressed_index_size: Int8 | null;
  uncompressed_toast_size: Int8 | null;
  uncompressed_total_size: Int8 | null;
}

export interface _TimescaledbInternalHypertableChunkLocalSize {
  chunk_id: number | null;
  chunk_name: string | null;
  chunk_schema: string | null;
  compressed_heap_size: Int8 | null;
  compressed_index_size: Int8 | null;
  compressed_toast_size: Int8 | null;
  compressed_total_size: Int8 | null;
  heap_bytes: Int8 | null;
  hypertable_id: number | null;
  hypertable_name: string | null;
  hypertable_schema: string | null;
  index_bytes: Int8 | null;
  toast_bytes: Int8 | null;
  total_bytes: Int8 | null;
}

export interface _TimescaledbInternalJobErrors {
  error_data: Json | null;
  finish_time: Timestamp | null;
  job_id: number;
  pid: number | null;
  start_time: Timestamp | null;
}

export interface AuthAuditLogEntries {
  created_at: Timestamp | null;
  id: string;
  instance_id: string | null;
  ip_address: Generated<string>;
  payload: Json | null;
}

export interface AuthFlowState {
  auth_code: string;
  authentication_method: string;
  code_challenge: string;
  code_challenge_method: AuthCodeChallengeMethod;
  created_at: Timestamp | null;
  id: string;
  provider_access_token: string | null;
  provider_refresh_token: string | null;
  provider_type: string;
  updated_at: Timestamp | null;
  user_id: string | null;
}

export interface AuthIdentities {
  created_at: Timestamp | null;
  email: Generated<string | null>;
  id: Generated<string>;
  identity_data: Json;
  last_sign_in_at: Timestamp | null;
  provider: string;
  provider_id: string;
  updated_at: Timestamp | null;
  user_id: string;
}

export interface AuthInstances {
  created_at: Timestamp | null;
  id: string;
  raw_base_config: string | null;
  updated_at: Timestamp | null;
  uuid: string | null;
}

export interface AuthMfaAmrClaims {
  authentication_method: string;
  created_at: Timestamp;
  id: string;
  session_id: string;
  updated_at: Timestamp;
}

export interface AuthMfaChallenges {
  created_at: Timestamp;
  factor_id: string;
  id: string;
  ip_address: string;
  verified_at: Timestamp | null;
}

export interface AuthMfaFactors {
  created_at: Timestamp;
  factor_type: AuthFactorType;
  friendly_name: string | null;
  id: string;
  secret: string | null;
  status: AuthFactorStatus;
  updated_at: Timestamp;
  user_id: string;
}

export interface AuthRefreshTokens {
  created_at: Timestamp | null;
  id: Generated<Int8>;
  instance_id: string | null;
  parent: string | null;
  revoked: boolean | null;
  session_id: string | null;
  token: string | null;
  updated_at: Timestamp | null;
  user_id: string | null;
}

export interface AuthSamlProviders {
  attribute_mapping: Json | null;
  created_at: Timestamp | null;
  entity_id: string;
  id: string;
  metadata_url: string | null;
  metadata_xml: string;
  sso_provider_id: string;
  updated_at: Timestamp | null;
}

export interface AuthSamlRelayStates {
  created_at: Timestamp | null;
  flow_state_id: string | null;
  for_email: string | null;
  from_ip_address: string | null;
  id: string;
  redirect_to: string | null;
  request_id: string;
  sso_provider_id: string;
  updated_at: Timestamp | null;
}

export interface AuthSchemaMigrations {
  version: string;
}

export interface AuthSessions {
  aal: AuthAalLevel | null;
  created_at: Timestamp | null;
  factor_id: string | null;
  id: string;
  ip: string | null;
  not_after: Timestamp | null;
  refreshed_at: Timestamp | null;
  tag: string | null;
  updated_at: Timestamp | null;
  user_agent: string | null;
  user_id: string;
}

export interface AuthSsoDomains {
  created_at: Timestamp | null;
  domain: string;
  id: string;
  sso_provider_id: string;
  updated_at: Timestamp | null;
}

export interface AuthSsoProviders {
  created_at: Timestamp | null;
  id: string;
  resource_id: string | null;
  updated_at: Timestamp | null;
}

export interface AuthUsers {
  aud: string | null;
  banned_until: Timestamp | null;
  confirmation_sent_at: Timestamp | null;
  confirmation_token: string | null;
  confirmed_at: Generated<Timestamp | null>;
  created_at: Timestamp | null;
  deleted_at: Timestamp | null;
  email: string | null;
  email_change: string | null;
  email_change_confirm_status: Generated<number | null>;
  email_change_sent_at: Timestamp | null;
  email_change_token_current: Generated<string | null>;
  email_change_token_new: string | null;
  email_confirmed_at: Timestamp | null;
  encrypted_password: string | null;
  id: string;
  instance_id: string | null;
  invited_at: Timestamp | null;
  is_sso_user: Generated<boolean>;
  is_super_admin: boolean | null;
  last_sign_in_at: Timestamp | null;
  phone: Generated<string | null>;
  phone_change: Generated<string | null>;
  phone_change_sent_at: Timestamp | null;
  phone_change_token: Generated<string | null>;
  phone_confirmed_at: Timestamp | null;
  raw_app_meta_data: Json | null;
  raw_user_meta_data: Json | null;
  reauthentication_sent_at: Timestamp | null;
  reauthentication_token: Generated<string | null>;
  recovery_sent_at: Timestamp | null;
  recovery_token: string | null;
  role: string | null;
  updated_at: Timestamp | null;
}

export interface BoardColumns {
  board_id: string;
  created_at: Generated<Timestamp>;
  creating_user_id: string;
  id: Generated<string>;
  position: number;
  title: string;
}

export interface BoardIdeas {
  board_id: string;
  created_at: Generated<Timestamp>;
  description: string;
  id: Generated<string>;
  requesting_user_id: string;
  title: string;
}

export interface BoardItems {
  column_id: string;
  created_at: Generated<Timestamp>;
  creating_user_id: string;
  id: Generated<string>;
  position: number;
  title: string;
}

export interface Boards {
  created_at: Generated<Timestamp>;
  creating_user_id: string;
  id: Generated<string>;
  name: string;
}

export interface BoardVotes {
  count: number | null;
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  item_id: string | null;
  user_id: string | null;
}

export interface ExtensionsPgStatStatements {
  blk_read_time: number | null;
  blk_write_time: number | null;
  calls: Int8 | null;
  dbid: number | null;
  jit_emission_count: Int8 | null;
  jit_emission_time: number | null;
  jit_functions: Int8 | null;
  jit_generation_time: number | null;
  jit_inlining_count: Int8 | null;
  jit_inlining_time: number | null;
  jit_optimization_count: Int8 | null;
  jit_optimization_time: number | null;
  local_blks_dirtied: Int8 | null;
  local_blks_hit: Int8 | null;
  local_blks_read: Int8 | null;
  local_blks_written: Int8 | null;
  max_exec_time: number | null;
  max_plan_time: number | null;
  mean_exec_time: number | null;
  mean_plan_time: number | null;
  min_exec_time: number | null;
  min_plan_time: number | null;
  plans: Int8 | null;
  query: string | null;
  queryid: Int8 | null;
  rows: Int8 | null;
  shared_blks_dirtied: Int8 | null;
  shared_blks_hit: Int8 | null;
  shared_blks_read: Int8 | null;
  shared_blks_written: Int8 | null;
  stddev_exec_time: number | null;
  stddev_plan_time: number | null;
  temp_blk_read_time: number | null;
  temp_blk_write_time: number | null;
  temp_blks_read: Int8 | null;
  temp_blks_written: Int8 | null;
  toplevel: boolean | null;
  total_exec_time: number | null;
  total_plan_time: number | null;
  userid: number | null;
  wal_bytes: Numeric | null;
  wal_fpi: Int8 | null;
  wal_records: Int8 | null;
}

export interface ExtensionsPgStatStatementsInfo {
  dealloc: Int8 | null;
  stats_reset: Timestamp | null;
}

export interface NetHttpRequestQueue {
  body: Buffer | null;
  headers: Json;
  id: Generated<Int8>;
  method: string;
  timeout_milliseconds: number;
  url: string;
}

export interface NetHttpResponse {
  content: string | null;
  content_type: string | null;
  created: Generated<Timestamp>;
  error_msg: string | null;
  headers: Json | null;
  id: Int8 | null;
  status_code: number | null;
  timed_out: boolean | null;
}

export interface PgsodiumDecryptedKey {
  associated_data: string | null;
  comment: string | null;
  created: Timestamp | null;
  decrypted_raw_key: Buffer | null;
  expires: Timestamp | null;
  id: string | null;
  key_context: Buffer | null;
  key_id: Int8 | null;
  key_type: PgsodiumKeyType | null;
  name: string | null;
  parent_key: string | null;
  raw_key: Buffer | null;
  raw_key_nonce: Buffer | null;
  status: PgsodiumKeyStatus | null;
}

export interface PgsodiumKey {
  associated_data: Generated<string | null>;
  comment: string | null;
  created: Generated<Timestamp>;
  expires: Timestamp | null;
  id: Generated<string>;
  key_context: Generated<Buffer | null>;
  key_id: Generated<Int8 | null>;
  key_type: PgsodiumKeyType | null;
  name: string | null;
  parent_key: string | null;
  raw_key: Buffer | null;
  raw_key_nonce: Buffer | null;
  status: Generated<PgsodiumKeyStatus | null>;
  user_data: string | null;
}

export interface PgsodiumMaskColumns {
  associated_columns: string | null;
  attname: string | null;
  attrelid: number | null;
  format_type: string | null;
  key_id: string | null;
  key_id_column: string | null;
  nonce_column: string | null;
}

export interface PgsodiumMaskingRule {
  associated_columns: string | null;
  attname: string | null;
  attnum: number | null;
  attrelid: number | null;
  col_description: string | null;
  format_type: string | null;
  key_id: string | null;
  key_id_column: string | null;
  nonce_column: string | null;
  priority: number | null;
  relname: string | null;
  relnamespace: string | null;
  security_invoker: boolean | null;
  view_name: string | null;
}

export interface PgsodiumValidKey {
  associated_data: string | null;
  created: Timestamp | null;
  expires: Timestamp | null;
  id: string | null;
  key_context: Buffer | null;
  key_id: Int8 | null;
  key_type: PgsodiumKeyType | null;
  name: string | null;
  status: PgsodiumKeyStatus | null;
}

export interface StorageBuckets {
  allowed_mime_types: string[] | null;
  avif_autodetection: Generated<boolean | null>;
  created_at: Generated<Timestamp | null>;
  file_size_limit: Int8 | null;
  id: string;
  name: string;
  owner: string | null;
  owner_id: string | null;
  public: Generated<boolean | null>;
  updated_at: Generated<Timestamp | null>;
}

export interface StorageMigrations {
  executed_at: Generated<Timestamp | null>;
  hash: string;
  id: number;
  name: string;
}

export interface StorageObjects {
  bucket_id: string | null;
  created_at: Generated<Timestamp | null>;
  id: Generated<string>;
  last_accessed_at: Generated<Timestamp | null>;
  metadata: Json | null;
  name: string | null;
  owner: string | null;
  owner_id: string | null;
  path_tokens: Generated<string[] | null>;
  updated_at: Generated<Timestamp | null>;
  version: string | null;
}

export interface SupabaseFunctionsHooks {
  created_at: Generated<Timestamp>;
  hook_name: string;
  hook_table_id: number;
  id: Generated<Int8>;
  request_id: Int8 | null;
}

export interface SupabaseFunctionsMigrations {
  inserted_at: Generated<Timestamp>;
  version: string;
}

export interface SupabaseMigrationsSchemaMigrations {
  name: string | null;
  statements: string[] | null;
  version: string;
}

export interface TickerStreamData {
  close: number;
  high: number;
  low: number;
  open: number;
  stream_id: string;
  timestamp: Int8;
  volume_usd: number;
}

export interface TickerStreams {
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  period: string;
  source: string;
  tag: string;
  ticker: string;
}

export interface TimescaledbExperimentalChunkReplicationStatus {
  chunk_name: string | null;
  chunk_schema: string | null;
  desired_num_replicas: number | null;
  hypertable_name: string | null;
  hypertable_schema: string | null;
  non_replica_nodes: string[] | null;
  num_replicas: Int8 | null;
  replica_nodes: string[] | null;
}

export interface TimescaledbExperimentalPolicies {
  config: Json | null;
  hypertable_name: string | null;
  hypertable_schema: string | null;
  proc_name: string | null;
  proc_schema: string | null;
  relation_name: string | null;
  relation_schema: string | null;
  schedule_interval: Interval | null;
}

export interface TimescaledbInformationChunks {
  chunk_name: string | null;
  chunk_schema: string | null;
  chunk_tablespace: string | null;
  data_nodes: string[] | null;
  hypertable_name: string | null;
  hypertable_schema: string | null;
  is_compressed: boolean | null;
  primary_dimension: string | null;
  primary_dimension_type: string | null;
  range_end: Timestamp | null;
  range_end_integer: Int8 | null;
  range_start: Timestamp | null;
  range_start_integer: Int8 | null;
}

export interface TimescaledbInformationCompressionSettings {
  attname: string | null;
  hypertable_name: string | null;
  hypertable_schema: string | null;
  orderby_asc: boolean | null;
  orderby_column_index: number | null;
  orderby_nullsfirst: boolean | null;
  segmentby_column_index: number | null;
}

export interface TimescaledbInformationContinuousAggregates {
  compression_enabled: boolean | null;
  finalized: boolean | null;
  hypertable_name: string | null;
  hypertable_schema: string | null;
  materialization_hypertable_name: string | null;
  materialization_hypertable_schema: string | null;
  materialized_only: boolean | null;
  view_definition: string | null;
  view_name: string | null;
  view_owner: string | null;
  view_schema: string | null;
}

export interface TimescaledbInformationDataNodes {
  node_name: string | null;
  options: string[] | null;
  owner: string | null;
}

export interface TimescaledbInformationDimensions {
  column_name: string | null;
  column_type: string | null;
  dimension_number: Int8 | null;
  dimension_type: string | null;
  hypertable_name: string | null;
  hypertable_schema: string | null;
  integer_interval: Int8 | null;
  integer_now_func: string | null;
  num_partitions: number | null;
  time_interval: Interval | null;
}

export interface TimescaledbInformationHypertables {
  compression_enabled: boolean | null;
  data_nodes: string[] | null;
  hypertable_name: string | null;
  hypertable_schema: string | null;
  is_distributed: boolean | null;
  num_chunks: Int8 | null;
  num_dimensions: number | null;
  owner: string | null;
  replication_factor: number | null;
  tablespaces: string[] | null;
}

export interface TimescaledbInformationJobErrors {
  err_message: string | null;
  finish_time: Timestamp | null;
  job_id: number | null;
  pid: number | null;
  proc_name: string | null;
  proc_schema: string | null;
  sqlerrcode: string | null;
  start_time: Timestamp | null;
}

export interface TimescaledbInformationJobs {
  application_name: string | null;
  check_name: string | null;
  check_schema: string | null;
  config: Json | null;
  fixed_schedule: boolean | null;
  hypertable_name: string | null;
  hypertable_schema: string | null;
  initial_start: Timestamp | null;
  job_id: number | null;
  max_retries: number | null;
  max_runtime: Interval | null;
  next_start: Timestamp | null;
  owner: string | null;
  proc_name: string | null;
  proc_schema: string | null;
  retry_period: Interval | null;
  schedule_interval: Interval | null;
  scheduled: boolean | null;
}

export interface TimescaledbInformationJobStats {
  hypertable_name: string | null;
  hypertable_schema: string | null;
  job_id: number | null;
  job_status: string | null;
  last_run_duration: Interval | null;
  last_run_started_at: Timestamp | null;
  last_run_status: string | null;
  last_successful_finish: Timestamp | null;
  next_start: Timestamp | null;
  total_failures: Int8 | null;
  total_runs: Int8 | null;
  total_successes: Int8 | null;
}

export interface UserEvents {
  data: Json | null;
  event: string;
  id: Generated<string>;
  timestamp: Generated<Timestamp>;
  user_id: string;
}

export interface VaultDecryptedSecrets {
  created_at: Timestamp | null;
  decrypted_secret: string | null;
  description: string | null;
  id: string | null;
  key_id: string | null;
  name: string | null;
  nonce: Buffer | null;
  secret: string | null;
  updated_at: Timestamp | null;
}

export interface VaultSecrets {
  created_at: Generated<Timestamp>;
  description: Generated<string>;
  id: Generated<string>;
  key_id: Generated<string | null>;
  name: string | null;
  nonce: Generated<Buffer | null>;
  secret: string;
  updated_at: Generated<Timestamp>;
}

export interface DB {
  "_realtime.extensions": _RealtimeExtensions;
  "_realtime.schema_migrations": _RealtimeSchemaMigrations;
  "_realtime.tenants": _RealtimeTenants;
  "_timescaledb_catalog.chunk": _TimescaledbCatalogChunk;
  "_timescaledb_catalog.chunk_constraint": _TimescaledbCatalogChunkConstraint;
  "_timescaledb_catalog.chunk_copy_operation": _TimescaledbCatalogChunkCopyOperation;
  "_timescaledb_catalog.chunk_data_node": _TimescaledbCatalogChunkDataNode;
  "_timescaledb_catalog.chunk_index": _TimescaledbCatalogChunkIndex;
  "_timescaledb_catalog.compression_algorithm": _TimescaledbCatalogCompressionAlgorithm;
  "_timescaledb_catalog.compression_chunk_size": _TimescaledbCatalogCompressionChunkSize;
  "_timescaledb_catalog.continuous_agg": _TimescaledbCatalogContinuousAgg;
  "_timescaledb_catalog.continuous_agg_migrate_plan": _TimescaledbCatalogContinuousAggMigratePlan;
  "_timescaledb_catalog.continuous_agg_migrate_plan_step": _TimescaledbCatalogContinuousAggMigratePlanStep;
  "_timescaledb_catalog.continuous_aggs_bucket_function": _TimescaledbCatalogContinuousAggsBucketFunction;
  "_timescaledb_catalog.continuous_aggs_hypertable_invalidation_log": _TimescaledbCatalogContinuousAggsHypertableInvalidationLog;
  "_timescaledb_catalog.continuous_aggs_invalidation_threshold": _TimescaledbCatalogContinuousAggsInvalidationThreshold;
  "_timescaledb_catalog.continuous_aggs_materialization_invalidation_log": _TimescaledbCatalogContinuousAggsMaterializationInvalidationLog;
  "_timescaledb_catalog.dimension": _TimescaledbCatalogDimension;
  "_timescaledb_catalog.dimension_partition": _TimescaledbCatalogDimensionPartition;
  "_timescaledb_catalog.dimension_slice": _TimescaledbCatalogDimensionSlice;
  "_timescaledb_catalog.hypertable": _TimescaledbCatalogHypertable;
  "_timescaledb_catalog.hypertable_compression": _TimescaledbCatalogHypertableCompression;
  "_timescaledb_catalog.hypertable_data_node": _TimescaledbCatalogHypertableDataNode;
  "_timescaledb_catalog.metadata": _TimescaledbCatalogMetadata;
  "_timescaledb_catalog.remote_txn": _TimescaledbCatalogRemoteTxn;
  "_timescaledb_catalog.tablespace": _TimescaledbCatalogTablespace;
  "_timescaledb_config.bgw_job": _TimescaledbConfigBgwJob;
  "_timescaledb_internal.bgw_job_stat": _TimescaledbInternalBgwJobStat;
  "_timescaledb_internal.bgw_policy_chunk_stats": _TimescaledbInternalBgwPolicyChunkStats;
  "_timescaledb_internal.compressed_chunk_stats": _TimescaledbInternalCompressedChunkStats;
  "_timescaledb_internal.hypertable_chunk_local_size": _TimescaledbInternalHypertableChunkLocalSize;
  "_timescaledb_internal.job_errors": _TimescaledbInternalJobErrors;
  "auth.audit_log_entries": AuthAuditLogEntries;
  "auth.flow_state": AuthFlowState;
  "auth.identities": AuthIdentities;
  "auth.instances": AuthInstances;
  "auth.mfa_amr_claims": AuthMfaAmrClaims;
  "auth.mfa_challenges": AuthMfaChallenges;
  "auth.mfa_factors": AuthMfaFactors;
  "auth.refresh_tokens": AuthRefreshTokens;
  "auth.saml_providers": AuthSamlProviders;
  "auth.saml_relay_states": AuthSamlRelayStates;
  "auth.schema_migrations": AuthSchemaMigrations;
  "auth.sessions": AuthSessions;
  "auth.sso_domains": AuthSsoDomains;
  "auth.sso_providers": AuthSsoProviders;
  "auth.users": AuthUsers;
  board_columns: BoardColumns;
  board_ideas: BoardIdeas;
  board_items: BoardItems;
  board_votes: BoardVotes;
  boards: Boards;
  "extensions.pg_stat_statements": ExtensionsPgStatStatements;
  "extensions.pg_stat_statements_info": ExtensionsPgStatStatementsInfo;
  "net._http_response": NetHttpResponse;
  "net.http_request_queue": NetHttpRequestQueue;
  "pgsodium.decrypted_key": PgsodiumDecryptedKey;
  "pgsodium.key": PgsodiumKey;
  "pgsodium.mask_columns": PgsodiumMaskColumns;
  "pgsodium.masking_rule": PgsodiumMaskingRule;
  "pgsodium.valid_key": PgsodiumValidKey;
  "storage.buckets": StorageBuckets;
  "storage.migrations": StorageMigrations;
  "storage.objects": StorageObjects;
  "supabase_functions.hooks": SupabaseFunctionsHooks;
  "supabase_functions.migrations": SupabaseFunctionsMigrations;
  "supabase_migrations.schema_migrations": SupabaseMigrationsSchemaMigrations;
  ticker_stream_data: TickerStreamData;
  ticker_streams: TickerStreams;
  "timescaledb_experimental.chunk_replication_status": TimescaledbExperimentalChunkReplicationStatus;
  "timescaledb_experimental.policies": TimescaledbExperimentalPolicies;
  "timescaledb_information.chunks": TimescaledbInformationChunks;
  "timescaledb_information.compression_settings": TimescaledbInformationCompressionSettings;
  "timescaledb_information.continuous_aggregates": TimescaledbInformationContinuousAggregates;
  "timescaledb_information.data_nodes": TimescaledbInformationDataNodes;
  "timescaledb_information.dimensions": TimescaledbInformationDimensions;
  "timescaledb_information.hypertables": TimescaledbInformationHypertables;
  "timescaledb_information.job_errors": TimescaledbInformationJobErrors;
  "timescaledb_information.job_stats": TimescaledbInformationJobStats;
  "timescaledb_information.jobs": TimescaledbInformationJobs;
  user_events: UserEvents;
  "vault.decrypted_secrets": VaultDecryptedSecrets;
  "vault.secrets": VaultSecrets;
}
