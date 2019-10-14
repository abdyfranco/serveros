<?PHP

require_once("/Applications/Server.app/Contents/ServerRoot/usr/share/devicemgr/backend/php/utf8.php");  // For UTF8String

function plist_decode($str, $removeBogusKeys=TRUE, $filterKeyValues=NULL) {
  $parser = new plistParser();
  if (!$removeBogusKeys) $parser->removeBogusKeys = FALSE;
  if (!empty($filterKeyValues) && is_array($filterKeyValues)) $parser->filterKeyValues = $filterKeyValues;
  return $parser->parseString($str);
} // plist_decode

function plist_decode_file($path) {
  $parser = new plistParser();
  return $parser->parseFile($path);
} // plist_decode_file


/**
 * PropertyList class
 * Implements writing Apple Property List (.plist) XML and text files from an array.
 *
 * @author Jesus A. Alvarez <zydeco@namedfork.net>
 */

function plist_encode_text ($obj) {
    $plist = new PropertyList($obj);
    return $plist->text();
}

function plist_encode_xml ($obj) {
    $plist = new PropertyList($obj);
    return $plist->xml();
}

class PropertyList
{
    private $obj, $xml, $text;

    public function __construct ($obj) {
        $this->obj = $obj;
    }

    private static function is_assoc ($array) {
        return (is_array($array) && 0 !== count(array_diff_key($array, array_keys(array_keys($array)))));
    }

    public function xml () {
        if (isset($this->xml)) return $this->xml;
        $x = new XMLWriter();
        $x->openMemory();
        $x->setIndent(TRUE);
        $x->startDocument('1.0', 'UTF-8');
        $x->writeDTD('plist', '-//Apple Computer//DTD PLIST 1.0//EN', 'http://www.apple.com/DTDs/PropertyList-1.0.dtd');
        $x->startElement('plist');
        $x->writeAttribute('version', '1.0');
        $this->xmlWriteValue($x, $this->obj);
        $x->endElement(); // plist
        $x->endDocument();
        $this->xml = $x->outputMemory();
        return $this->xml;
    }

    public function text() {
        if (isset($this->text)) return $this->text;
        $text = '';
        $this->textWriteValue($text, $this->obj);
        $this->text = $text;
        return $this->text;
    }

    private function xmlWriteDict(XMLWriter $x, &$dict) {
        $x->startElement('dict');
        foreach($dict as $k => &$v) {
            // Ignore bogus keys
            if (is_null($v)) trigger_error("Unsupported NULL value for key '$k' in dictionary", E_USER_WARNING);
            if ($k != "__BOGUS__") {
                $x->writeElement('key', $k);
                $this->xmlWriteValue($x, $v);
            }
        }
        $x->endElement(); // dict
    }

    private function xmlWriteArray(XMLWriter $x, &$arr) {
        $x->startElement('array');
        foreach($arr as &$v)
            $this->xmlWriteValue($x, $v);
        $x->endElement(); // array
    }

    private function xmlWriteValue(XMLWriter $x, &$v) {
        if (is_int($v) || is_long($v))
            $x->writeElement('integer', $v);
        elseif (is_float($v) || is_real($v) || is_double($v))
            $x->writeElement('real', $v);
        elseif (is_string($v))
            $x->writeElement('string', $v);
        elseif (is_bool($v))
            $x->writeElement($v?'true':'false');
        elseif (PropertyList::is_assoc($v))
            $this->xmlWriteDict($x, $v);
        elseif (is_array($v))
            $this->xmlWriteArray($x, $v);
        elseif (is_a($v, 'PlistData'))
            $x->writeElement('data', $v->base64EncodedData()."\n");
        elseif (is_a($v, 'PlistDate'))
            $x->writeElement('date', $v->encodedDate());
        else {
            trigger_error('Unsupported data type in plist ('.get_class($v).')', E_USER_WARNING);
            $x->writeElement('string', $v);
        }
    }

    private function textWriteValue(&$text, &$v, $indentLevel = 0) {
        if (is_int($v) || is_long($v))
            $text .= sprintf("%d", $v);
        elseif (is_float($v) || is_real($v) || is_double($v))
            $text .= sprintf("%g", $v);
        elseif (is_string($v))
            $this->textWriteString($text, $v);
        elseif (is_bool($v))
            $text .= $v?'YES':'NO';
        elseif (PropertyList::is_assoc($v))
            $this->textWriteDict($text, $v, $indentLevel);
        elseif (is_array($v))
            $this->textWriteArray($text, $v, $indentLevel);
        elseif (is_a($v, 'PlistData'))
            $text .= '<' . $v->hexEncodedData() . '>';
        elseif (is_a($v, 'PlistDate'))
            $text .= '"' . $v->ISO8601Date() . '"';
        else {
            trigger_error('Unsupported data type in plist ('.get_class($v).')', E_USER_WARNING);
            $this->textWriteString($text, $v);
        }
    }

    private function textWriteString(&$text, &$str) {
        $oldlocale = setlocale(LC_CTYPE, "0");
        if (ctype_alnum($str)) $text .= $str;
        else $text .= '"' . $this->textEncodeString($str) . '"';
        setlocale(LC_CTYPE, $oldlocale);
    }

    private function textEncodeString(&$str) {
        $newstr = '';
        $i = 0;
        $len = strlen($str);
        while($i < $len) {
            $ch = ord(substr($str, $i, 1));
            if ($ch == 0x22 || $ch == 0x5C) {
                // escape double quote, backslash
                $newstr .= '\\' . chr($ch);
                $i++;
            } else if ($ch >= 0x07 && $ch <= 0x0D ){
                // control characters with escape sequences
                $newstr .= '\\' . substr('abtnvfr', $ch - 7, 1);
                $i++;
            } else if ($ch < 32) {
                // other non-printable characters escaped as unicode
                $newstr .= sprintf('\U%04x', $ch);
                $i++;
            } else if ($ch < 128) {
                // ascii printable
                $newstr .= chr($ch);
                $i++;
            } else if ($ch == 192 || $ch == 193) {
                // invalid encoding of ASCII characters
                $i++;
            } else if (($ch & 0xC0) == 0x80){
                // part of a lost multibyte sequence, skip
                $i++;
            } else if (($ch & 0xE0) == 0xC0) {
                // U+0080 - U+07FF (2 bytes)
                $u = (($ch & 0x1F) << 6) | (ord(substr($str, $i+1, 1)) & 0x3F);
                $newstr .= sprintf('\U%04x', $u);
                $i += 2;
            } else if (($ch & 0xF0) == 0xE0) {
                // U+0800 - U+FFFF (3 bytes)
                $u = (($ch & 0x0F) << 12) | ((ord(substr($str, $i+1, 1)) & 0x3F) << 6) | (ord(substr($str, $i+2, 1)) & 0x3F);
                $newstr .= sprintf('\U%04x', $u);
                $i += 3;
            } else if (($ch & 0xF8) == 0xF0) {
                // U+10000 - U+3FFFF (4 bytes)
                $u = (($ch & 0x07) << 18) | ((ord(substr($str, $i+1, 1)) & 0x3F) << 12) | ((ord(substr($str, $i+2, 1)) & 0x3F) << 6) | (ord(substr($str, $i+3, 1)) & 0x3F);
                $newstr .= sprintf('\U%04x', $u);
                $i += 4;
            } else {
                // 5 and 6 byte sequences are not valid UTF-8
                $i++;
            }
        }
        return $newstr;
    }

    private function textWriteDict(&$text, &$dict, $indentLevel) {
        if (count($dict) == 0) {
            $text .= '{}';
            return;
        }
        $text .= "{\n";
        $indent = '';
        $indentLevel++;
        while(strlen($indent) < $indentLevel) $indent .= "\t";
        foreach($dict as $k => &$v) {
            $text .= $indent;
            $this->textWriteValue($text, $k);
            $text .= ' = ';
            $this->textWriteValue($text, $v, $indentLevel);
            $text .= ";\n";
        }
        $text .= substr($indent, 0, -1) . '}';
    }

    private function textWriteArray(&$text, &$arr, $indentLevel) {
        if (count($arr) == 0) {
            $text .= '()';
            return;
        }
        $text .= "(\n";
        $indent = '';
        $indentLevel++;
        while(strlen($indent) < $indentLevel) $indent .= "\t";
        foreach($arr as &$v) {
            $text .= $indent;
            $this->textWriteValue($text, $v, $indentLevel);
            $text .= ",\n";
        }
        $text .= substr($indent, 0, -1) . ')';
    }
} // class PropertyList

class PlistData
{
    private $data;
    private $encoded;

    public function __construct($str, $pre_encoded = FALSE) {
        $this->data    = ($pre_encoded ? trim($str) : $str);
        $this->encoded = $pre_encoded;
    }

    public function base64EncodedData () {
        return ($this->encoded ? $this->data : base64_encode($this->data));
    }

    public function hexEncodedData () {
        $len = strlen($this->data);
        $hexstr = '';
        for($i = 0; $i < $len; $i += 4)
            $hexstr .= bin2hex(substr($this->data, $i, 4)) . ' ';
        return substr($hexstr, 0, -1);
    }

    public function rawData() {
      return ($this->encoded ? base64_decode($this->data) : $this->data);
    } // rawData
} // class PlistData

class PlistDate
{
    private $dateval;

    public function __construct($init = NULL) {
        if (is_int($init))
            $this->dateval = $init;
        elseif (is_string($init))
            $this->dateval = strtotime($init);
        elseif ($init == NULL)
            $this->dateval = time();
    }

    public function ISO8601Date() {
        return gmdate('Y-m-d\TH:i:s\Z', $this->dateval);
    }
} // class PlistDate


class plistParser extends XMLReader
{
  public $removeBogusKeys = TRUE;
  public $filterKeyValues = [];

  public function parse($file) {
    trigger_error('plistParser::parse() is deprecated, please use plistParser::parseFile()', E_USER_NOTICE);
    return $this->parseFile($file);
  }

  public function parseFile($file) {
    if(basename($file) == $file) {
      throw new Exception("Non-relative file path expected", 1);
    }
    // HACK: Give the file-based parsing the empty dictionary/array tag hack-fix, too
    $string = file_get_contents($file);
    if ($string === FALSE) throw new Exception("Error reading plist");
    return $this->parseString($string);
    // $this->open("file://" . $file);
    // return $this->process();
  }

  public function parseString($string) {
      // HACK: Get <dict/> working
      $string = str_replace("<dict/>", "<dict><key>__BOGUS__</key><true/></dict>", $string);
      $string = str_replace("<array/>", "<array><string>__BOGUS__</string></array>", $string);
      $this->XML($string);
      $this->raw_string = $string;
      return $this->process();
  }

  private function process() {
    // plist's always start with a doctype, use it as a validity check
    $this->read();
    if($this->nodeType !== XMLReader::DOC_TYPE || $this->name !== "plist") {
      throw new Exception(sprintf("Error parsing plist. nodeType: %d -- Name: %s", $this->nodeType, $this->name), 2);
    }

    // as one additional check, the first element node is always a plist
    if(!$this->next("plist") || $this->nodeType !== XMLReader::ELEMENT || $this->name !== "plist") {
      throw new Exception(sprintf("Error parsing plist. nodeType: %d -- Name: %s", $this->nodeType, $this->name), 3);
    }

    $plist = array();
    while($this->read()) {
      if($this->nodeType == XMLReader::ELEMENT) {
        $plist[] = $this->parse_node();
      }
    }
    if(count($plist) == 1 && $plist[0]) {
      // Most plists have a dict as their outer most tag
      // So instead of returning an array with only one element
      // return the contents of the dict instead
      return $plist[0];
    } else {
      return $plist;
    }
  }

  private function parse_node() {
    // If not an element, nothing for us to do
    if($this->nodeType !== XMLReader::ELEMENT) return;

    switch($this->name) {
      case 'data':
        return new PlistData($this->getNodeText(), TRUE);
        break;
      case 'real':
        return floatval($this->getNodeText());
        break;
      case 'string':
        return UTF8String($this->getNodeText());    // Make sure the resulting string is valid UTF-8
        break;
      case 'integer':
        return intval($this->getNodeText());
        break;
      case 'date':
        return $this->getNodeText();
        break;
      case 'true':
        return true;
        break;
      case 'false':
        return false;
        break;
      case 'array':
        return $this->parse_array();
        break;
      case 'dict':
        return $this->parse_dict();
        break;
      default:
        // per DTD, the above is the only valid types
        throw new Exception("Not a valid plist: '".$this->name."' is not a valid type.\n".$this->raw_string, 4);
    }
  }

  private function parse_dict() {
    $array = array();
    $this->nextOfType(XMLReader::ELEMENT);
    do {
      if($this->nodeType !== XMLReader::ELEMENT || $this->name !== "key") {
        // If we aren't on a key, then jump to the next key
        // per DTD, dicts have to have <key><somevalue> and nothing else
        if(!$this->next("key")) {
          // no more keys left so per DTD we are done with this dict
          return $array;
        }
      }
      $key = $this->getNodeText();
      $this->nextOfType(XMLReader::ELEMENT);
      if($key !== "__BOGUS__" || !$this->removeBogusKeys) {
           if (empty($this->filterKeyValues) || !in_array(strtolower($key), $this->filterKeyValues)) $array[$key] = $this->parse_node();
      }
      $this->nextOfType(XMLReader::ELEMENT, XMLReader::END_ELEMENT);
    } while($this->nodeType && !$this->isNodeOfTypeName(XMLReader::END_ELEMENT, "dict"));
    return $array;
  }

  private function parse_array() {
    $array = array();
    $this->nextOfType(XMLReader::ELEMENT);
    do {
      $val = $this->parse_node();
      if ($val !== "__BOGUS__") $array[] = $val;
      // skip over any whitespace
      $this->nextOfType(XMLReader::ELEMENT, XMLReader::END_ELEMENT);
    } while($this->nodeType && !$this->isNodeOfTypeName(XMLReader::END_ELEMENT, "array"));
    return $array;
  }

  private function getNodeText() {
    $string = $this->readString();
    // now gobble up everything up to the closing tag
    $this->nextOfType(XMLReader::END_ELEMENT);
    return $string;
  }

  private function nextOfType() {
    $types = func_get_args();
    // skip to next
    $this->read();
    // check if it's one of the types requested and loop until it's one we want
    while($this->nodeType && !(in_array($this->nodeType, $types))) {
      // node isn't of type requested, so keep going
      $this->read();
    }
  }

  private function isNodeOfTypeName($type, $name) {
    return $this->nodeType === $type && $this->name === $name;
  }
} // class plistParser
