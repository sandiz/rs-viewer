import React from 'react'
//import PropTypes from 'prop-types';

//eslint-disable-next-line
export default class StatsTableView extends React.Component {
  //eslint-disable-next-line
  constructor(props) {
    super(props);
  }
  render = () => {
    return (
      <table style={{ width: 100 + '%' }} >
        <tbody>
          <tr>
            <td>Total</td>
            <td className="ta-left">
              <span id="lead_total">903</span>
            </td>
          </tr>
          <tr>
            <td>95-100%</td>
            <td className="ta-left">
              <span>
                <svg id="lead_tier_1_svg" height="100%" width="100%">
                  <rect width="40%" height="100%" style={{ fill: 'lightgreen', strokeWidth: 2, stroke: 'rgb(0,0,0)' }} />
                  <text id="lead_tier_1_count" x="10" y="17" fontSize="17px">222</text>
                </svg>
              </span>
            </td>
          </tr>
          <tr>
            <td>90-95%</td>
            <td className="ta-left">
              <span>
                <svg id="lead_tier_1_svg" height="100%" width="100%">
                  <rect width="20%" height="100%" style={{ fill: '#C8F749', strokeWidth: 2, stroke: 'rgb(0,0,0)' }} />
                  <text id="lead_tier_1_count" x="10" y="17" fontSize="17px">222</text>
                </svg>
              </span>
            </td>
          </tr>
          <tr>
            <td>1-90%</td>
            <td className="ta-left">
              <span>
                <svg id="lead_tier_1_svg" height="100%" width="100%">
                  <rect width="50%" height="100%" style={{ fill: 'yellow', strokeWidth: 2, stroke: 'rgb(0,0,0)' }} />
                  <text id="lead_tier_1_count" x="10" y="17" fontSize="17px">222</text>
                </svg>
              </span>
            </td>
          </tr>
          <tr>
            <td>Unplayed</td>
            <td className="ta-left">
              <span>
                <svg id="lead_tier_1_svg" height="100%" width="100%">
                  <rect width="80%" height="100%" style={{ fill: 'lightgray', strokeWidth: 2, stroke: 'rgb(0,0,0)' }} />
                  <text id="lead_tier_1_count" x="10" y="17" fontSize="17px">222</text>
                </svg>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}
