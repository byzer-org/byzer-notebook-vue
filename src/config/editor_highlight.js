
// eslint-disable-next-line 
ace.define('ace/mode/sql_highlight_rules', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text_highlight_rules'],
// eslint-disable-next-line 
  function (acequire, exports) {
    'use strict';

    var oop = acequire('ace/lib/oop');
    var TextHighlightRules = acequire('./text_highlight_rules').TextHighlightRules;

    var MlsqlHighlightRules = function () {

      var keywords = (
        'select|insert|update|delete|from|where|and|or|group|by|order|limit|offset|having|as|case|' +
        'when|else|end|type|left|right|join|on|outer|desc|asc|union|create|table|primary|key|if|' +
        'foreign|not|references|default|null|inner|cross|natural|database|drop|grant|' +
        'set|connect|load|train|run|predict|register|save|include|then|' + // Byzer 关键字
        '!show|!hdfs|!kill|!desc|!cache|!unCache|!if|!elif|!then|!else|!fi|!println|!runScript|!last|' +
        '!lastTableName|!tableRepartition|!saveFile|!emptyTable|!profiler|!python|!ray|!delta|!withWartermark|' +
        '!plugin|!kafkaTool|!callback' // 宏语法
      )

      var builtinConstants = (
        'true|false'
      )

      var builtinFunctions = (
        'avg|count|first|last|max|min|sum|ucase|lcase|mid|len|round|rank|now|format|' +
        'coalesce|ifnull|isnull|nvl'
      )

      var dataTypes = (
        'int|numeric|decimal|date|varchar|char|bigint|float|double|bit|binary|text|set|timestamp|' +
        'money|real|number|integer'
      )

      var keywordMapper = this.createKeywordMapper({
        'support.function': builtinFunctions,
        'keyword': keywords,
        'constant.language': builtinConstants,
        'storage.type': dataTypes
      }, 'identifier', true)

      this.$rules = {
        'start': [
          {
            token: 'comment',
            regex: '--.*$'
          },
          {
            token: 'comment',
            start: '/\\*',
            end: '\\*/'
          },
          {
            token: 'string',           // " string
            regex: '".*?"'
          },
          {
            token: 'string',           // ' string
            regex: '\'.*?\''
          },
          {
            token: 'string',           // ` string (apache drill)
            regex: '`.*?`'
          },
          {
            token: 'string',
            regex: '\'\'\'[\s\S]*?\'\'\''
          },
          {
            token: 'constant.numeric', // float
            regex: '[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b'
          },
          {
            token: keywordMapper,
            regex: '!?[a-zA-Z_$][a-zA-Z0-9_$]*\\b'
          },
          {
            token: 'keyword.operator',
            regex: '\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|='
          },
          {
            token: 'paren.lparen',
            regex: '[\\(]'
          },
          {
            token: 'paren.rparen',
            regex: '[\\)]'
          },
          {
            token: 'text',
            regex: '\\s+'
          }
        ]
      }
      this.normalizeRules()
    }

    oop.inherits(MlsqlHighlightRules, TextHighlightRules)

    exports.MlsqlHighlightRules = MlsqlHighlightRules
})
// eslint-disable-next-line 
ace.define('ace/mode/sql', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text', 'ace/mode/sql_highlight_rules'], function (acequire, exports) {
// eslint-disable-next-line   
  'use strict'

  var oop = acequire('ace/lib/oop');
  var TextMode = acequire('./text').Mode;
  var MlsqlHighlightRules = acequire('./sql_highlight_rules').MlsqlHighlightRules

  var Mode = function () {
    this.HighlightRules = MlsqlHighlightRules
    this.$behaviour = this.$defaultBehaviour
  }
  oop.inherits(Mode, TextMode)

  ;(function () {

    this.lineCommentStart = '--'

    this.$id = 'ace/mode/sql'
  }).call(Mode.prototype)

  exports.Mode = Mode

})
