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
  snippets: {},
  up: [
    {
      command: 'line',
      line: '-1'
    }
  ]
})
