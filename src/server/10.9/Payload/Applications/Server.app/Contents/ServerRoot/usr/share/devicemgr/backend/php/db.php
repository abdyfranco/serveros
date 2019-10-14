<?PHP
// -------------------------------------------------------------------------
// Copyright (c) 2014 Apple Inc. All rights reserved.
//
// IMPORTANT NOTE: This file is licensed only for use on Apple-branded
// computers and is subject to the terms and conditions of the Apple Software
// License Agreement accompanying the package this file is a part of.
// You may not port this file to another platform without Apple's written consent.
//-------------------------------------------------------------------------

require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/config.php");
require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/common.php");

define('kDMCurrentTimestamp', 'dm_current_timestamp()');
define('kPGEpochTimestamp', "epoch");

// Connect to the database on inclusion

try {
  if (function_exists('apc_fetch')) {
    $schema = apc_fetch('gTableSchemas', $success);
    if (!$success) {
      require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/schema.php");    // Load the schema
      apc_store('gTableSchemas', $GLOBALS['gTableSchemas']);
    } else {
      $GLOBALS['gTableSchemas'] = $schema;
    }
  } else {
    require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/schema.php");
  }
  $db_config = $MDM_CONFIG['database'];

  // Force a few options that we rely upon
  $options = $db_config['options'];
  $options[PDO::ATTR_CASE]    = PDO::CASE_NATURAL;
  $options[PDO::ATTR_ERRMODE] = PDO::ERRMODE_EXCEPTION;
  $max = 100;   // Put an upper limit on the number of retries, lest we find ourselves in some kind of infinite loop
  $num = 0;
  do {
    $retry = FALSE;
    try {
      $dbh = new PDO($db_config['dsn'], $db_config['username'], $db_config['password'], $options);
    } catch (Exception $e) {
      $retry = IsRecoverableConnectionFailure($e);
      if (!$retry) {
        LogPDOException($e);
        throw $e;
      }
      $num += 1;
      if ($num > $max) DieInternalError("Giving up after $max consecutive connection failures.");
      $msg = $e->getMessage();
      $delay = mt_rand(1000, $num * 4000);      // Delay a random amount, a max of 4000us (4ms) per retry attempt
      LogMsg("@@@ Retry #$num of database connection due to failure '$msg'.... (in ".($delay/1000.0)."ms) @@@");
      usleep($delay);
    } // catch
  } while ($retry);

  if (empty($dbh)) DieInternalError("Failed to connect to database '".$db_config['dsn']."'");
  $GLOBALS['DB'] = $dbh;
  $GLOBALS['gInTransaction'] = FALSE;
} catch (Exception $e) {
  ProcessException($e);   // Will not return
}

//-------------------------------------------------------------------------

function BeginSavepoint($name)
{
  global $gInTransaction;
  if (!$gInTransaction) DieInternalError(__FUNCTION__.": Not inside a transaction.");

  _query("SAVEPOINT $name");
} // BeginSavepoint

//-------------------------------------------------------------------------

function BeginTransaction($mode = 'SERIALIZABLE')
{
  global $gInTransaction;
  if ($gInTransaction) DieInternalError(__FUNCTION__.": Already inside a transaction.");

  if (!empty($mode)) $mode = "ISOLATION LEVEL $mode";
  _query("BEGIN $mode");
  $gInTransaction = TRUE;
} // BeginTransaction

//-------------------------------------------------------------------------

function CommitSavepoint($name)
{
  global $gInTransaction;
  if (!$gInTransaction) DieInternalError(__FUNCTION__.": Not inside a transaction.");

  _query("RELEASE SAVEPOINT $name");
} // CommitSavepoint

//-------------------------------------------------------------------------

function CommitTransaction()
{
  global $gInTransaction;
  if (!$gInTransaction) DieInternalError(__FUNCTION__.": Not inside a transaction.");

  _query("COMMIT");
  $gInTransaction = FALSE;
} // CommitTransaction

//-------------------------------------------------------------------------

function CopyAllCVExcept(&$target, &$source, $except, $copyNULLs = FALSE)
{
  if ($source["_table"] != $target["_table"]) DieInternalError(__FUNCTION__." requires objects from the same database table");
  _validate_row_array($target);
  _validate_row_array($source);

  $schema = $target["_schema"];
  foreach ($schema as $key => $type) {
    if (in_array($key, $except)) continue;  // Skip it
    $val = _cv($source, $key, $type);
    if ($copyNULLs || !is_null($val)) _set_cv($target, $key, $val, $type);
  }
} // CopyAllCVExcept

// --------------------------------------------------------------------

function CopyCV(&$target, &$source, $col)
{
  if ($source["_table"] != $target["_table"]) DieInternalError(__FUNCTION__." requires objects from the same database table");

  $schema = $target['_schema'];
  if (is_array($col)) {
    _validate_row_array($target);
    _validate_row_array($source);
    foreach ($col as $key) {
      $type = $schema[$key];
      _set_cv($target, $key, _cv($source, $key, $type), $type);
    }
  } else {
    _validate_row_array($target, $col);
    _validate_row_array($source, $col);
    $type = $schema[$col];
    _set_cv($target, $col, _cv($source, $col, $type), $type);
  }
} // CopyCV

//-------------------------------------------------------------------------

function CV(&$values, $col)
{
  _validate_row_array($values, $col);
  return _cv($values, $col, $values['_schema'][$col]);
} // CV

//-------------------------------------------------------------------------

function CVDA(&$values, $col)
{
  $da = CV($values, 'dynamic_attributes');
  if (!is_array($da) || !array_key_exists($col, $da)) return NULL;
  return $da[$col];
} // CVDA

//-------------------------------------------------------------------------

function DestroyInDatabase(&$vals)
{
  global $DB;

  _validate_row_array($vals);
  if (empty($vals['id'])) return;

  $result = _execute_raw_sql('DELETE FROM "'.$vals['_table'].'" WHERE id = '.$vals['id']);
  if ($result) unset($vals['id']);
  return $result;
} // DestroyInDatabase

//-------------------------------------------------------------------------

function EmptyCV($values, $col)
{
  _validate_row_array($values, $col);
  $new_key = "_new_$col";
  if (array_key_exists($new_key, $values)) return empty($values[$new_key]);
  return empty($values[$col]);
} // EmptyCV

// --------------------------------------------------------------------

function ExecuteSQL($table, $sql, $bind, $name = NULL)
{
  global $gTableSchemas;

  if (!array_key_exists($table, $gTableSchemas)) DieInternalError(__FUNCTION__.": attempt to create record for table '$table' without a schema defined.");

  $st = _prepare_statement($sql, $table, $bind, $name);
  $result = _execute_statement($st);
  unset($st);
  return $result;
} // ExecuteSQL

//-------------------------------------------------------------------------

function ExecuteSQLAndFetchRaw($table, $sql, $bind, $fetch_all = FALSE, $name = NULL)
{
  global $gTableSchemas;

  if (!array_key_exists($table, $gTableSchemas)) DieInternalError(__FUNCTION__.": attempt to create record for table '$table' without a schema defined.");

  $st = _prepare_statement($sql, $table, $bind, $name);
  $result = _execute_statement_and_fetch($st, $fetch_all);
  unset($st);
  return $result;
} // ExecuteSQLAndFetchRaw

// --------------------------------------------------------------------

function ExecuteSQLFunction($fn, $params)
{
  global $gTableSchemas, $gLogLevel;

  if (!array_key_exists($fn, $gTableSchemas)) DieInternalError(__FUNCTION__.": attempt to call function '$fn' without a schema defined.");

  $args = "";
  foreach ($params as $arg => $val) {
    if (empty($args)) $args = ":$arg";
    else $args .= ",:$arg";
  }
  $sql = "SELECT $fn($args)";

  if ($gLogLevel > 2) LogMsg(__FUNCTION__.": $sql\nParams = ".PrintArrayObscuringValuesForKeys($params), 3);

  $st = _prepare_statement($sql, $fn, $params, $fn);
  $result = _execute_statement_and_fetch($st, TRUE);
  unset($st);
  return $result;
} // ExecuteSQLFunction

//-------------------------------------------------------------------------

function FindAllBySQL($table, $where, $bind, $select_modifier = '')
{
  global $gTableSchemas;

  if (!array_key_exists($table, $gTableSchemas)) DieInternalError(__FUNCTION__.": attempt to create record for table '$table' without a schema defined.");

  $st = _prepare_statement("SELECT * FROM \"$table\" $where $select_modifier", $table, $bind);
  $rows = _execute_statement_and_fetch($st, TRUE);
  if (is_array($rows)) {
    $schema = $gTableSchemas[$table];
    foreach ($rows as &$row) {
      $row['_table']  = $table;
      $row['_schema'] = $schema;
    }
  } else $rows = FALSE;
  return $rows;
} // FindAllBySQL

//-------------------------------------------------------------------------

function FindBySQL($table, $where, $bind, $select_modifier = '')
{
  global $gTableSchemas;

  if (!array_key_exists($table, $gTableSchemas)) DieInternalError(__FUNCTION__.": attempt to create record for table '$table' without a schema defined.");

  $st = _prepare_statement("SELECT * FROM \"$table\" $where $select_modifier", $table, $bind);
  $row = _execute_statement_and_fetch($st);
  if ($row) {
    $row['_table']  = $table;
    $row['_schema'] = $gTableSchemas[$table];
  }
  return $row;
} // FindBySQL

//-------------------------------------------------------------------------

function FindInDatabase($table, $col, $val, $select_modifier = '')
{
  if (empty($val)) return FALSE;
  $where = "WHERE \"$col\" = :$col LIMIT 1";
  $result = FindBySQL($table, $where, [$col => $val], $select_modifier);
  return $result;
} // FindInDatabase

// --------------------------------------------------------------------

function FromTable($values, $kind)
{
  if (Table($values) == $kind) return TRUE;

  // Double-check that this is a known table kind by looking in the defined schemas
  global $gTableSchemas;
  if (!array_key_exists($kind, $gTableSchemas)) DieInternalError("Unknown table kind '$kind'");
  return FALSE;
} // FromTable

// --------------------------------------------------------------------

function IssetCV($values, $col)
{
  if (empty($values)) return FALSE;
  _validate_row_array($values, $col);
  $new_key = "_new_$col";
  if (array_key_exists($new_key, $values)) return isset($values[$new_key]);
  return isset($values[$col]);
} // IssetCV

// --------------------------------------------------------------------

function IsRecoverableConnectionFailure(Exception $e)
{
  if (!($e instanceof PDOException)) return FALSE;

  // A '08006' state is one we should retry
  $state = $e->getCode();
  return ($state == '08006' || strpos($e->getMessage(), '08006') !== FALSE);
} // IsRecoverableConnectionFailure

// --------------------------------------------------------------------

function IsTransactionFailure(Exception $e)
{
  if (!($e instanceof PDOException)) return FALSE;

  // Any "Class 40" error code is a transaction-related failure
  $state = $e->getCode();
  if (strlen($state) == 5 && strpos($state, '40') === 0) return TRUE;

  // Sometimes the SQLSTATE value ends up being changed, so still also check the specific message
  $msg = $e->getMessage();
  if (strlen($msg) > 0 && stripos($msg, 'could not serialize') !== FALSE) return TRUE;
  return FALSE;
} // IsTransactionFailure

// --------------------------------------------------------------------

function LogPDOException($e, $st = NULL, $level = 0, $query = "")
{
  $msg  = $e->getMessage();
  $info = PrintArrayObscuringValuesForKeys($e->errorInfo);
  $code = $e->getCode();
  $bt   = $e->getTraceAsString();
  $dump = "";
  if (!IsTransactionFailure($e)) {  // Only log all the extra stuff when it's not an expected error
    if (!empty($st)) {
      ob_start();
      $st->debugDumpParams();
      $ob = ob_get_contents();
      ob_end_clean();
      $dump .= "\nDUMP: '$ob'";
    }
    if (!empty($query)) $dump .= "\nQUERY: '$query'";
    LogMsg("PDOException: '$msg' (info: '$info', code:$code)$dump\n$bt", $level);
  } else {
    LogMsg("PDOException: '$msg' (info: '$info', code:$code)", $level);
  }
  return $msg;
} // LogPDOException

// --------------------------------------------------------------------

function LogSQL($sql, $name = NULL)
{
  $cr = (strpos($sql, "\n") ? "\n" : " ");  // If the query is multi-line, log it starting on a new line
  LogMsg((empty($name) ? "SQL" : $name).":$cr$sql;");
} // LogSQL

// --------------------------------------------------------------------

function NewRecordForTable($table, $id = NULL)
{
  global $gTableSchemas;

  if (!array_key_exists($table, $gTableSchemas)) DieInternalError("attempt to create record for table '$table' without a schema defined.");
  $row = ["_table" => $table, "_schema" => $gTableSchemas[$table]];
  if (!empty($id)) $row["id"] = $id;
  return $row;
} // NewRecordForTable

// --------------------------------------------------------------------

function PerformInTransaction($fn, $args = NULL, $mode = 'SERIALIZABLE')
{
  global $gLogLevel;

  $max = 100;   // Put an upper limit on the number of retries, lest we find ourselves in some kind of infinite loop
  $num = 0;
  $original_level = $gLogLevel;
  do {
    $retry = FALSE;
    BeginTransaction($mode);
    try {
      if (!empty($args)) $result = $fn($args);
      else               $result = $fn();
      CommitTransaction();
    } catch (PDOException $e) {
      $retry = IsTransactionFailure($e);
      if (!$retry) LogPDOException($e);     // Log before doing the rollback, as the rollback could possibly throw an exception, too
      RollbackTransaction();
      if (!$retry) {
        $gLogLevel = $original_level;
        throw $e;
      }
      $num += 1;
      if ($num > $max) {
        $gLogLevel = $original_level;
        DieInternalError(__FUNCTION__.": Giving up after $max consecutive transaction failures.");
      }
      $msg = $e->getMessage();
      $delay = mt_rand(1000, $num * 4000);      // Delay a random amount, a max of 4000us (4ms) per retry attempt
      LogMsg("@@@ Retry #$num of '$fn' due to database transaction failure '$msg'.... (in ".($delay/1000.0)."ms) @@@");
      usleep($delay);
      if ($num < 4 && $gLogLevel < $num) $gLogLevel = $num;
    }
  } while ($retry);
  $gLogLevel = $original_level;

  return $result;
} // PerformInTransaction

//-------------------------------------------------------------------------

function ReloadFromDatabase(&$row, $select_modifier = '')
{
  $row = FindInDatabase(Table($row), 'id', CV($row, 'id'), $select_modifier);
  return $row;
} // ReloadFromDatabase

//-------------------------------------------------------------------------

function RollbackSavepoint($name)
{
  global $gInTransaction;
  if (!$gInTransaction) DieInternalError(__FUNCTION__.": Not inside a transaction.");

  _query("ROLLBACK TO SAVEPOINT $name");
} // RollbackSavepoint

//-------------------------------------------------------------------------

function RollbackTransaction()
{
  global $gInTransaction;
  if (!$gInTransaction) DieInternalError(__FUNCTION__.": Not inside a transaction.");

  _query("ROLLBACK");
  $gInTransaction = FALSE;
} // RollbackTransaction

//-------------------------------------------------------------------------

function SaveToDatabase(&$values, $update_ts = TRUE)
{
  global $DB;

  _validate_row_array($values);
  $table  = $values['_table'];
  $schema = $values['_schema'];
  $is_new = (empty($values['id']));

  if ($update_ts) {
    $update_ts = kDMCurrentTimestamp;
    if ($is_new) $values['_new_created_at'] = $values['created_at'] = $update_ts;
    else         $values['_new_updated_at'] = $values['updated_at'] = $update_ts;
  }

  $cols  = []; // Will hold quoted column names
  $names = []; // Will hold bind placeholder strings
  $bind  = []; // Will hold the values we need to bind to the prepared statement
  foreach ($values as $key => $val) {
    if (is_numeric($key)) continue;
    if ($key[0] == "_") {
      $bind[$key] = $val; // Copy over the metadata, as _prepare_statement needs it
      continue;
    }
    if (!array_key_exists($key, $schema)) continue; // A value not in the schema, should never happen
    $new_key = "_new_$key";
    if (!array_key_exists($new_key, $values)) continue; // A value that wasn't changed, so let's leave it out of our SQL

    if ($key != "id") {
      $cols[]  = "\"$key\"";
      $names[] = ":$key";
      $values[$key] = $bind[$key] = $values[$new_key];
      unset($values[$new_key]);   // It's not new any more
    }
  }

  if (empty($cols)) return FALSE;   // Nothing to save!

  $cols  = implode(",", $cols);
  $names = implode(",", $names);

  if (!$is_new) {
    $sql = "UPDATE \"$table\" SET ($cols) = ($names) WHERE id = :id";
    $bind['id'] = $values['id'];
  } else $sql = "INSERT INTO \"$table\" ($cols) VALUES($names) RETURNING id";

  $st = _prepare_statement($sql, $table, $bind);
  $result = _execute_statement($st);
  if ($is_new) {
    $id = $st->fetchColumn();
    if (empty($id)) {
      // Did not get the id back from the INSERT statement. That might be because the table is partitioned.
      // Ask the sequence for the table what
      // $table .= '_id_seq';
      // $sql = "SELECT last_value FROM $table LIMIT 1";
      // $st = $DB->prepare($sql);
      // $result = _execute_statement($st);
      // $id = $st->fetchColumn();
      if (empty($id)) DieInternalError("Did not receive id of newly inserted row or from $table.");
    }
    $values['id'] = $id;
    // LogMsg(__FUNCTION__.": id=$id", 3);
  }

  unset($st);
  return $result;
} // SaveToDatabase

//-------------------------------------------------------------------------

function SetAndSaveAttribute(&$row, $col, $value)
{
  _validate_row_array($row, $col);

  $table = $row['_table'];
  $t = kDMCurrentTimestamp;
  $bind = ['id' => $row['id']];
  if ($col != "updated_at") {
    _set_cv($row, $col, $value, $row['_schema'][$col]); // Use _set_cv to handle any necessary data conversions
    $new_key = "_new_$col";
    $bind[$col] = $row[$new_key];
    $sql  = "UPDATE \"$table\" SET \"$col\" = :$col, updated_at = :updated_at WHERE id = :id";
  } else {
    $sql = "UPDATE \"$table\" SET updated_at = :updated_at WHERE id = :id";
    $t = $value;
  }
  $bind['updated_at'] = $row['updated_at'] = $t;

  return ExecuteSQL($table, $sql, $bind);
} // SetAndSaveAttribute

//-------------------------------------------------------------------------

function SetAndSaveAttributeByTableAndID($table, $id, $col, $value)
{
  $t = kDMCurrentTimestamp;
  $bind = ['id' => $id];
  if ($col != "updated_at") {
    $bind[$col] = $value;
    $sql  = "UPDATE \"$table\" SET \"$col\" = :$col, updated_at = :updated_at WHERE id = :id";
  } else {
    $sql = "UPDATE \"$table\" SET updated_at = :updated_at WHERE id = :id";
    $t = $value;
  }
  $bind["updated_at"] = $t;

  return ExecuteSQL($table, $sql, $bind);
} // SetAndSaveAttributeByTableAndID

//-------------------------------------------------------------------------

function SetCV(&$values, $col, $val)
{
  _validate_row_array($values, $col);
  _set_cv($values, $col, $val, $values['_schema'][$col]);
} // SetCV

//-------------------------------------------------------------------------

function SetCVDA(&$values, $col, $val)
{
  SetCVDAMulti($values, [$col => $val]);
} // SetCVDA

//-------------------------------------------------------------------------

function SetCVDAMulti(&$values, $colvals)
{
  $da = CV($values, 'dynamic_attributes');
  if (!is_array($da)) $da = [];
  SetCV($values, 'dynamic_attributes', array_merge($da, $colvals)); // $colvals is 2nd to overwrite existing values
} // SetCVDAMulti

//-------------------------------------------------------------------------

function SetCVMulti(&$values, $colvals, $ignore_unknown_cols = FALSE)
{
  _validate_row_array($values, $colvals, $ignore_unknown_cols);
  _set_multiple_cv($values, $colvals, $ignore_unknown_cols);
} // SetCVMulti

// --------------------------------------------------------------------

function Schema($values)
{
  _validate_row_array($values);
  return $values['_schema'];
  } // Schema

// --------------------------------------------------------------------

function Table($values)
{
  _validate_row_array($values);
  return $values['_table'];
} // Table

// --------------------------------------------------------------------

function ValidColumn($values, $col)
{
  _validate_row_array($values);
  return isset($values['_schema'][$col]);
} // ValidColumn

//-------------------------------------------------------------------------

function _cv(&$values, $col, $type)
{
  $new_key = "_new_$col";
  if (array_key_exists($new_key, $values)) return $values[$new_key];  // Return the value previously set

  if ($type == 'array' || $type == 'hash') {
    $usv_key = "_usv_$col";
    if (!array_key_exists($usv_key, $values)) { // We haven't unserialized this value yet
      if (!empty($values[$col])) {              // Make sure there's something to unserialize
        $values[$usv_key] = ParseYAML($values[$col]);
        $val = $values[$usv_key];
      } else $val = NULL;                       // Nothing to unserialize
    } else $val = $values[$usv_key];            // Use the previously unserialized value
  } else $val = (isset($values[$col]) ? $values[$col] : NULL);
  return $val;
} // _cv

//-------------------------------------------------------------------------

function _execute_raw_sql($sql, $name = NULL)
{
  global $DB, $gLogSQL;

  if ($gLogSQL) LogSQL($sql, $name);
  $st = $DB->prepare($sql);
  $result = _execute_statement($st);
  unset($st);
  return $result;
} // _execute_raw_sql

//-------------------------------------------------------------------------

function _execute_statement($st)
{
  try {
    $result = $st->execute();
  } catch (PDOException $e) {
    LogPDOException($e, $st);
    throw $e;
  }
  // if (!$result) {
  //  ob_start();
  //  $st->debugDumpParams();
  //  $out = ob_get_contents();
  //  ob_end_clean();
  //  LogMsg("(!PDOException) statement=".PrintArrayObscuringValuesForKeys($st)."\ndump: $out");
  //  return FALSE;
  // }
  return $result;
} // _execute_statement

//-------------------------------------------------------------------------

function _execute_statement_and_fetch($st, $fetch_all = FALSE)
{
  $result = _execute_statement($st);

  if ($result) {
    if ($fetch_all) {
      $result = $st->fetchAll(PDO::FETCH_ASSOC);
    } else {
      $result = $st->fetch(PDO::FETCH_ASSOC);
      if (count($result) <= 1) $result = FALSE;
    }
  }
  unset($st);
  return $result;
} // _execute_statement_and_fetch

// --------------------------------------------------------------------

function _prepare_statement($sql, $table, $values, $name = NULL)
{
  global $DB, $TIMESTAMP_DATE_FORMAT, $gTableSchemas, $gLogSQL;

  $logSQL = $sql;
  $bind = [];
  $schema = $gTableSchemas[$table];
  if (empty($schema) || !is_array($schema)) DieInternalError("Attempting to use table '$table' without a schema defined");
  foreach ($values as $key => $val) {
    if ($key[0] == "_") continue; // Ignore private values (they carry metadata we need)

    if (empty($schema[$key])) {
      LogMsg(__FUNCTION__.": values = ".PrintArrayObscuringValuesForKeys($values));
      DieInternalError("No schema type provided for column '$key' in table '$table'");
    }
    if ($val !== NULL) {
      $type = $schema[$key];
      switch ($type) {
      case 'int':
        $val = intval($val);
        $type = PDO::PARAM_INT;
        break;

      case 'float':
        $val = strval($val);
        $type = PDO::PARAM_STR;
        break;

      case 'boolean':
        $val = ($val ? 'TRUE' : 'FALSE');
        $type = PDO::PARAM_STR;
        break;

      case 'timestamp':
        if ($val === kDMCurrentTimestamp) {
          $sql = str_replace(":$key", $val, $sql);
          unset($key);
        } elseif (is_numeric($val)) $val = gmdate($TIMESTAMP_DATE_FORMAT, $val);  // Assume it's already in the right format if it's not numeric
        $type = PDO::PARAM_STR;
        break;

      case 'array':
      case 'hash':
        if (!empty($val)) {
          $yaml = yaml_emit($val, YAML_UTF8_ENCODING, YAML_LN_BREAK);

          if (!empty($yaml)) {
            $val  = $yaml;
            $type = PDO::PARAM_STR;
          } else {
            LogMsg("yaml_emit failed for '$key' ($type), writing NULL\n".PrintArrayObscuringValuesForKeys($val));
            $val  = NULL;
            $type = PDO::PARAM_NULL;
          }
        } else {
          $val  = NULL;
          $type = PDO::PARAM_NULL;
        }
        break;

      default:
        $type = PDO::PARAM_STR;
      } // switch
    } else  $type = PDO::PARAM_NULL;      // A NULL value

    if (isset($key)) {
      $bind[$key] = ['val' => $val, 'type' => $type];  // If $key is empty it means we inserted the value directly into the SQL
      if ($gLogSQL) {
        if ($type == PDO::PARAM_NULL) $val = "NULL";
        elseif ($type != PDO::PARAM_INT) $val = "'$val'";
        $logSQL = str_replace(":$key", $val, $logSQL);
      }
    }
  } // foreach ($values)

  // Bind the accumulated values
  $st = $DB->prepare($sql);
  foreach ($bind as $key => $a) $st->bindValue(":$key", $a['val'], $a['type']);

  if ($gLogSQL) LogSQL($logSQL, $name);
  return $st;
} // _prepare_statement

//-------------------------------------------------------------------------

function _query($sql, $name = NULL)
{
  global $DB, $gLogSQL;

  if ($gLogSQL) LogSQL($sql, $name);
  $st = $DB->query($sql);
  unset($st);
} // _query

//-------------------------------------------------------------------------

function _set_cv(&$values, $col, $val, $type)
{
  $new_key = "_new_$col";
  // Quick sanity check of the types. Note that you can always specify NULL for any type
  if (isset($val)) {
    if ($type == 'array' || $type == 'hash') {
      if (!is_array($val)) DieInternalError("attempt to set non-array value on column '$col' of type '$type' in table '".$values['_table']."'");
    } else {
      if (is_array($val) || is_object($val)) DieInternalError("attempt to set array/object value on column '$col' of type '$type' in table '".$values['_table']."'");
    }
  }

  $values[$new_key] = $val;
  if (!isset($values[$col])) $values[$col] = TRUE;  // Just set some value so SaveToDatabase finds the new value
} // _set_cv

//-------------------------------------------------------------------------

function _set_multiple_cv(&$values, $colvals, $ignore_unknown_cols = FALSE)
{
  // Assumes all keys of $colvals are valid keys in the schema
  $schema = $values['_schema'];
  foreach ($colvals as $col => $val) {
    if ($ignore_unknown_cols && !array_key_exists($col, $schema)) continue; // Skip the unknown column (otherwise, we're assuming the array has passed _validate_row_array
    $type = $schema[$col];
    _set_cv($values, $col, $val, $type);
  }
} // _set_multiple_cv

//-------------------------------------------------------------------------

function _validate_row_array($values, $col = FALSE, $ignore_unknown_cols = FALSE)
{
  if (!is_array($values)) DieInternalError("row array isn't an array");
  if (!array_key_exists('_table', $values)) DieInternalError("row array has no table specification: ".PrintArrayObscuringValuesForKeys($values));
  if (!array_key_exists('_schema', $values)) DieInternalError("row array has no schema specification for '".$values['_table']."'");
  $schema = $values['_schema'];
  if (!is_array($schema)) DieInternalError("invalid schema");
  if ($col && !$ignore_unknown_cols) {
    if (is_array($col)) {
      foreach ($col as $key => $val) {
        if (!array_key_exists($key, $schema)) DieInternalError("table '".$values['_table']."' has no column '$key'");
      }
    } elseif (!array_key_exists($col, $schema)) DieInternalError("table '".$values['_table']."' has no column '$col'");
  }
} // _validate_row_array

// --------------------------------------------------------------------

