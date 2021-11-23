import * as util from '../index'

describe('util-index', () => {
  it('timeToStr', () => {
    const dateTime = '1000'
    const expectedResult = {
      'day': 0,
      'hour': 0,
      'minutes': 0,
      'ms': 0,
      'seconds': 1
    }
    expect(util.timeToStr(dateTime)).toEqual(expectedResult)
  })
  it('formatGetParams', () => {
    const params = {
      keyword: '123',
      page: 0,
      size: 10
    }
    const expectedResult = '&keyword=123&page=0&size=10'
    expect(util.formatGetParams(params)).toBe(expectedResult)
  })
})