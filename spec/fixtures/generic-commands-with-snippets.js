'use babel'

export default Object.freeze({
  down: [
    {
      command: 'line',
      line: '+1'
    }
  ],
  go: {
    to: {
      line: {
        '#': [
          {
            command: 'line'
          }
        ]
      }
    }
  },
  line: {
    '#': [
      {
        command: 'line'
      }
    ]
  },
  snippets: {
    foo: {
      bar: {},
      baz: {},
    },
    spam: {}
  },
  up: [
    {
      command: 'line',
      line: '-1'
    }
  ]
})
