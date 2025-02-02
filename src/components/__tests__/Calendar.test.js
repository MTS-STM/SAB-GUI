import React from 'react'
import { mount } from 'enzyme'
import CalendarAdapter, { renderDayBoxes } from '../Calendar'
import {
  getMonthNameAndYear,
  getStartMonth,
  getEnabledDays,
} from '../../utils/calendarDates'
import MemoryRouter from 'react-router-dom/MemoryRouter'

import parse from 'date-fns/parse'
import addDays from 'date-fns/add_days'
import format from 'date-fns/format'

const test_location = {
  email: 'test@cic.gc.ca',
  phone: '1-888-000-0000',
  recurring: {
    jun: ['wed', 'thurs'],
    jul: ['wed', 'thurs'],
    aug: ['wed', 'thurs'],
    sep: ['wed', 'thurs'],
    oct: ['tues', 'wed'],
    nov: ['tues', 'wed'],
    dec: ['tues', 'wed'],
  },
  blocked: '2018-10-02, 2018-10-03, 2018-10-10', // use CSV format => 2018-10-02, 2018-10-03, 2018-11-21
  locationHours: '8:00-16:00',
}

// Prevent jsdom console.error output from cluttering test output
window.scrollTo = jest.fn()
// TODO: Remove 👆 after jsdom/jsdom#1422 is resolved.

const getDateAtIndex = (wrapper, index) => {
  return wrapper.find('.DayPicker-Day[aria-disabled=false]').at(index)
}

const clickDate = (wrapper, index) => {
  return getDateAtIndex(wrapper, index).simulate('click')
}

const clickFirstDate = wrapper => {
  return clickDate(wrapper, 0)
}

const getDateStrings = wrapper => {
  return wrapper
    .find('#selectedDays-list time')
    .map(time => time.text())
    .join(' ')
}

const getErrorMessageString = wrapper => {
  return wrapper
    .find('#selectedDays-error')
    .first()
    .text()
}

const defaultProps = ({ value = '', dayLimit = 3 } = {}) => {
  const startMonth = getStartMonth(new Date())
  return {
    input: { value: value, onChange: () => {} },
    dayLimit: dayLimit,
    initialMonth: startMonth,
    fromMonth: startMonth,
    context: {
      store: {
        register: {
          accessibility: false,
        },
        selectProvince: {
          locationId: '40',
        },
      },
    },
  }
}

const dayMonthYear = date => {
  return format(parse(date), 'dddd, MMMM D, YYYY')
}

const calDays = (date = new Date(), location) => {
  return useMonth(getEnabledDays(location, date))
}

/* eslint-disable security/detect-object-injection */
const collectDates = (accumulator, currentValue) => {
  const index = getMonthNameAndYear(currentValue, 'en')
  if (typeof accumulator[index] === 'undefined') {
    accumulator[index] = []
  }

  accumulator[index].push(currentValue)

  return accumulator
}

// find a month that has at least 3 dates we can use for tests
const useMonth = dates => {
  const groupedDates = dates.reduce(collectDates, {})

  let month = false

  Object.keys(groupedDates).forEach(function(key) {
    if (month) {
      return
    }
    if (groupedDates[key].length >= 3) {
      month = groupedDates[key]
    }
  })

  return month
}

describe('<CalendarAdapter />', () => {
  let days

  beforeEach(async () => {
    days = calDays()
  })

  it('renders current month', () => {
    const wrapper = mount(
      <MemoryRouter>
        <CalendarAdapter {...defaultProps()} />
      </MemoryRouter>,
    )
    const monthYear = getMonthNameAndYear(getStartMonth(new Date()), 'en')
    expect(wrapper.text()).toMatch(monthYear)
  })

  it('renders next month', () => {
    const wrapper = mount(
      <MemoryRouter>
        <CalendarAdapter {...defaultProps()} />
      </MemoryRouter>,
    )
    wrapper.find('.DayPicker-NavButton--next').simulate('click')

    const monthIn30Days = addDays(new Date(), 30)
    const monthYearin30Days = getMonthNameAndYear(monthIn30Days, 'en')
    const monthDifference = monthIn30Days.getMonth() - new Date().getMonth()
    // Month in 30 days is still this month
    if (monthDifference === 0) {
      expect(wrapper.text()).toContain(monthYearin30Days)
      // Month in 30 days is next month
    } else {
      expect(wrapper.text()).toContain(monthYearin30Days)
      expect(wrapper.text()).not.toContain(
        getMonthNameAndYear(new Date(), 'en'),
      )
    }
  })

  it('renders with expected aria attributes and tabindex attributes', () => {
    const wrapper = mount(
      <MemoryRouter>
        <CalendarAdapter {...defaultProps()} id="newID" tabIndex="4" />
      </MemoryRouter>,
    )
    let dayPicker = wrapper.find('.DayPicker')
    expect(dayPicker.props()['aria-describedby']).toEqual('firstDayString')
    expect(dayPicker.props()['aria-labelledby']).toEqual('renderMonthName')
    expect(dayPicker.props()['id']).toEqual('newID')
    expect(dayPicker.props()['tabIndex']).toEqual('4')

    let dayPickerWrapper = wrapper.find('.DayPicker-wrapper')
    expect(dayPickerWrapper.props()['tabIndex']).toBe(0)
  })

  it('will prefill a date if an initial value is provided', () => {
    const wrapper = mount(
      <MemoryRouter>
        <CalendarAdapter {...defaultProps({ value: [new Date(days[0])] })} />
      </MemoryRouter>,
    )

    expect(getDateStrings(wrapper)).toEqual(dayMonthYear(days[0]))
  })

  it('will prefill multiple dates if multiple initial values are provided', () => {
    const wrapper = mount(
      <MemoryRouter>
        <CalendarAdapter
          {...defaultProps({
            value: [new Date(days[0]), new Date(days[1])],
          })}
        />
      </MemoryRouter>,
    )

    const day1 = dayMonthYear(days[0])
    const day2 = dayMonthYear(days[1])

    expect(getDateStrings(wrapper)).toEqual(`${day1} ${day2}`)
  })

  // it('selects a date when it is clicked', () => {
  //   const days = calDays()
  //   const day1 = dayMonthYear(days[0])
  //   const day2 = dayMonthYear(days[1])

  //   const wrapper = mount(
  //     <MemoryRouter>
  //       <CalendarAdapter
  //         {...defaultProps({
  //           value: [new Date(days[1])],
  //         })}
  //       />
  //     </MemoryRouter>,
  //   )

  //   expect(wrapper.find('#selectedDays .day-box').every('.empty')).toBe(true)
  //   clickFirstDate(wrapper)
  //   expect(getDateStrings(wrapper)).toEqual(`${day1} ${day2}`)
  // })

  // it('orders selected dates chronologically', () => {
  //   const days = calDays()
  //   const day1 = dayMonthYear(days[0])
  //   const day2 = dayMonthYear(days[1])
  //   const day3 = dayMonthYear(days[2])

  //   const wrapper = mount(
  //     <MemoryRouter>
  //       <CalendarAdapter
  //         {...defaultProps({
  //           value: [new Date(days[0])],
  //         })}
  //       />
  //     </MemoryRouter>,
  //   )

  //   expect(wrapper.find('#selectedDays .day-box').every('.empty')).toBe(true)

  //   clickDate(wrapper, 2)

  //   expect(getDateStrings(wrapper)).toEqual(`${day1} ${day3}`)

  //   clickDate(wrapper, 1)

  //   expect(getDateStrings(wrapper)).toEqual(`${day1} ${day2} ${day3}`)

  //   clickDate(wrapper, 0)

  //   expect(getDateStrings(wrapper)).toEqual(`${day2} ${day3}`)
  // })

  it('renders header message corresponding to number of selected days', () => {
    const days = calDays()
    // const day1 = dayMonthYear(days[0])
    // const day2 = dayMonthYear(days[1])
    // const day3 = dayMonthYear(days[2])

    const wrapper = mount(
      <MemoryRouter>
        <CalendarAdapter
          {...defaultProps({
            value: [new Date(days[0])],
          })}
        />
      </MemoryRouter>,
    )

    expect(wrapper.find('#selectedDays-list .empty.day-box').length).toBe(2)
    expect(wrapper.find('label').text()).toEqual('Please select your time slot')

    // clickDate(wrapper, 1)
    // expect(getDateStrings(wrapper)).toEqual(`${day1} ${day2}`)
    // expect(wrapper.find('#selectedDays-list .empty.day-box').length).toBe(1)
    // expect(wrapper.find('h3').text()).toEqual(
    //   'Your 2 selected days, select 1 more:',
    // )

    // clickDate(wrapper, 2)
    // expect(getDateStrings(wrapper)).toEqual(`${day1} ${day2} ${day3}`)
    // expect(wrapper.find('#selectedDays-list .empty.day-box').length).toBe(0)
    // expect(wrapper.find('h3').text()).toEqual('Your 3 selected days:')
  })

  it('unselects a date when it is clicked twice', () => {
    const wrapper = mount(
      <MemoryRouter>
        <CalendarAdapter {...defaultProps()} />
      </MemoryRouter>,
    )

    expect(wrapper.find('#selectedDays .day-box').every('.empty')).toBe(true)

    // click the first available day (July 17th, 2018) twice
    clickFirstDate(wrapper)
    clickFirstDate(wrapper)
    expect(wrapper.find('#selectedDays .day-box').every('.empty')).toBe(true)
  })

  it('will not select more days once the limit is reached', () => {
    const day2 = dayMonthYear(days[1])

    const wrapper = mount(
      <MemoryRouter>
        <CalendarAdapter
          {...defaultProps({ value: [new Date(days[1])], dayLimit: 1 })}
        />
      </MemoryRouter>,
    )

    expect(getDateStrings(wrapper)).toEqual(day2)

    clickFirstDate(wrapper)
    expect(getDateStrings(wrapper)).toEqual(day2)
    expect(getErrorMessageString(wrapper)).toEqual(
      'You can’t select more than 1 day. To change your selections, remove a day first.',
    )
  })

  it('will remove maximum date error message if a date is unselected', () => {
    const day2 = dayMonthYear(days[1])

    const wrapper = mount(
      <MemoryRouter>
        <CalendarAdapter
          {...defaultProps({
            value: [new Date(days[1])],
            dayLimit: 1,
          })}
        />
      </MemoryRouter>,
    )
    clickFirstDate(wrapper)
    expect(getDateStrings(wrapper)).toEqual(day2)
    expect(getErrorMessageString(wrapper)).toEqual(
      'You can’t select more than 1 day. To change your selections, remove a day first.',
    )

    // click first "Remove date" button
    wrapper
      .find('#selectedDays-list button')
      .first()
      .simulate('click')
    expect(wrapper.find('#selectedDays .day-box').every('.empty')).toBe(true)
    expect(getErrorMessageString(wrapper)).toEqual('')
  })

  // it('will allow more days to be selected once a day is unselected', () => {
  //   const day1 = dayMonthYear(days[0])
  //   const day2 = dayMonthYear(days[1])

  //   const wrapper = mount(
  //     <MemoryRouter>
  //       <CalendarAdapter
  //         {...defaultProps({
  //           value: [new Date(days[1])],
  //           dayLimit: 1,
  //         })}
  //       />
  //     </MemoryRouter>,
  //   )

  //   expect(getDateStrings(wrapper)).toEqual(day2)

  //   clickDate(wrapper, 1)
  //   expect(wrapper.find('#selectedDays .day-box').every('.empty')).toBe(true)

  //   clickFirstDate(wrapper)

  //   expect(getDateStrings(wrapper)).toEqual(day1)
  // })

  // it('will keep pre-filled dates when clicking new ones', () => {
  //   const day1 = dayMonthYear(days[0])
  //   const day2 = dayMonthYear(days[1])
  //   const day3 = dayMonthYear(days[2])

  //   const wrapper = mount(
  //     <MemoryRouter>
  //       <CalendarAdapter
  //         {...defaultProps({
  //           value: [new Date(days[1]), new Date(days[2])],
  //         })}
  //       />
  //     </MemoryRouter>,
  //   )

  //   expect(getDateStrings(wrapper)).toEqual(`${day2} ${day3}`)

  //   clickFirstDate(wrapper)
  //   expect(getDateStrings(wrapper)).toEqual(`${day1} ${day2} ${day3}`)
  // })

  it('will un-click pre-filled dates when clicking new ones', () => {
    const day1 = dayMonthYear(days[0])
    const day2 = dayMonthYear(days[1])

    const wrapper = mount(
      <MemoryRouter>
        <CalendarAdapter
          {...defaultProps({
            value: [new Date(days[1]), new Date(days[0])],
          })}
        />
      </MemoryRouter>,
    )
    expect(getDateStrings(wrapper)).toEqual(`${day1} ${day2}`)

    clickFirstDate(wrapper)
    expect(getDateStrings(wrapper)).toEqual(day2)
  })

  // const events = [
  //   { eventType: 'click', options: {}, toString: 'click event' },
  //   {
  //     eventType: 'keypress',
  //     options: { key: ' ' },
  //     toString: 'keypress event with spacebar',
  //   },
  //   {
  //     eventType: 'keypress',
  //     options: { key: 'Enter' },
  //     toString: 'keypress event with enter key',
  //   },
  // ]

  // events.map(({ eventType, options, toString }) => {
  //   days = calDays()
  //   const day1 = dayMonthYear(days[0])
  //   const day2 = dayMonthYear(days[1])

  //   it(`will remove a date when its "Remove date" button is triggered by a ${toString}`, () => {
  //     const wrapper = mount(
  //       <MemoryRouter>
  //         <CalendarAdapter
  //           {...defaultProps({
  //             value: [new Date(days[1])],
  //           })}
  //         />
  //       </MemoryRouter>,
  //     )
  //     expect(wrapper.find('#selectedDays .day-box').every('.empty')).toBe(true)

  //     clickFirstDate(wrapper)
  //     expect(getDateStrings(wrapper)).toEqual(`${day1} ${day2}`)

  //     wrapper
  //       .find('#selectedDays-list button')
  //       .first()
  //       .simulate(eventType, options)
  //     expect(wrapper.find('#selectedDays .day-box').every('.empty')).toBe(true)
  //   })
  // })
})

describe('renderDayBoxes', () => {
  let defaultVals = {
    dayLimit: 1,
    selectedDays: [new Date('1957-11-03T00:00:00.000Z')],
    removeDayOnClickOrKeyPress: () => {},
  }

  it('renders days in english', () => {
    const wrapper = mount(
      <ul>
        {renderDayBoxes({
          ...defaultVals,
          locale: 'en',
          removeDayAltText: 'Remove day',
        })}
      </ul>,
    )
    let listItem = wrapper.find('ul li')
    expect(listItem.find('span').text()).toEqual('Sunday, November 3, 1957')

    let button = listItem.find('button')
    let label = 'Remove day: Sunday, November 3, 1957'
    expect(button.props()['aria-label']).toEqual(label)

    let imgs = button.find('svg')
    expect(imgs.length).toBe(1)
    expect(imgs.find('#titleId-0').text()).toEqual(label)
  })

  it('renders days in french', () => {
    const wrapper = mount(
      <ul>
        {renderDayBoxes({
          ...defaultVals,
          locale: 'fr',
          removeDayAltText: 'Supprimer cette journée',
        })}
      </ul>,
    )
    let listItem = wrapper.find('ul li')
    expect(listItem.find('span').text()).toEqual('dimanche 3 novembre 1957')

    let button = listItem.find('button')
    let label = 'Supprimer cette journée: dimanche 3 novembre 1957'
    expect(button.props()['aria-label']).toEqual(label)

    let imgs = button.find('svg')
    expect(imgs.length).toBe(1)
    expect(imgs.find('#titleId-0').text()).toEqual(label)
  })

  //to do (needs to be updated with calendar updates)
  xit('will block days on calendar', () => {
    // force a given date here so we can ensure we have blocked days
    const days = calDays('August 27, 2018', test_location)
    const day1 = dayMonthYear(days[0])
    const day2 = dayMonthYear(days[1])

    const wrapper = mount(
      <MemoryRouter>
        <CalendarAdapter
          {...defaultProps({
            value: [new Date(days[1]), new Date(days[0])],
          })}
        />
      </MemoryRouter>,
    )

    // Oct 2nd, 3 + 10th should be blocked
    expect(dayMonthYear(days[0])).toEqual('Tuesday, October 9, 2018')
    expect(dayMonthYear(days[1])).toEqual('Tuesday, October 16, 2018')
    expect(getDateStrings(wrapper)).toEqual(`${day1} ${day2}`)
  })
})
