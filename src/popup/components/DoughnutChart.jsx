import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Chart, Doughnut } from 'react-chartjs-2';
import DataProcessing from '../../js/DataProcessing';

export default class DoughnutChart extends Component {
  constructor(props) {
    super(props);

    this.chartInstance = null;
    this.lastHoveredItemIndex = null;
  }

  registerChartPlugin() {
    Chart.pluginService.register({
      beforeDraw: function(chart) {
        if (chart && chart.options && chart.options.customTextInside) {
          const bottomCorner = chart.chartArea.bottom;
          const rightCorner = chart.chartArea.right;
          const ctx = chart.chart.ctx;
          const texts = chart.options.customTextInside.split('\n');
          const fontSize = texts.length === 1 ? 24 : 20;

          ctx.restore();
          ctx.font = `${fontSize}px Roboto sans-serif`;
          ctx.textBaseline = 'middle';

          for (let i = 0; i < texts.length; i++) {
            const text = texts[i];
            const textX = Math.round((rightCorner - ctx.measureText(text).width) / 2);
            const textY = bottomCorner / 2 + ((i + 1) * 24) - ((texts.length + 1) * 12);

            ctx.fillText(text, textX, textY);
            ctx.save();
          }
        }
      },
    });
  }

  parseArrayOfSecondsToTimeString(array) {
    return DataProcessing.parseSecondsIntoTime(DataProcessing.sum(array));
  }

  onChartHover(chartData, event, items) {
    const chart = this.chartInstance.chartInstance;
    const hoveredItemIndex = items.length ? items[0]._index : null;
    const shouldProceed = () => {
      return hoveredItemIndex !== this.lastHoveredItemIndex;
    };

    if (!shouldProceed()) {
      return;
    }

    let hoveredItemName = null;
    let customTextInside = null;

    if (hoveredItemIndex !== null) {
      const chartDataset = chart.data.datasets[0];
      const itemDataInSeconds = chartDataset.data[hoveredItemIndex];
      const text = DataProcessing.parseSecondsIntoTime(itemDataInSeconds);
      const percentage = (itemDataInSeconds / DataProcessing.sum(chartData.data) * 100).toFixed(2);

      hoveredItemName = this.props.chartData.labels[hoveredItemIndex];
      customTextInside = `${text}\n${hoveredItemName.replace(/(.{17})..+/, '$1...')}\n${percentage}%`;
    } else {
      customTextInside = this.parseArrayOfSecondsToTimeString(chartData.data);
    }

    this.lastHoveredItemIndex = hoveredItemIndex;
    this.props.handleChartHover(hoveredItemName);

    chart.options.customTextInside = customTextInside;
    chart.update();
  }

  componentWillMount() {
    this.registerChartPlugin();
  }

  render() {
    if (!this.props.renderOnLoad) {
      return null;
    }

    const chartOptions = {
      maintainAspectRatio: false,
      cutoutPercentage: 58,
      customTextInside: this.parseArrayOfSecondsToTimeString(this.props.chartData.data),
      tooltips: {
        enabled: false,
      },
      legend: {
        display: false,
      },
      animation: {
        animateScale: true,
      },
      hover: {
        onHover: this.onChartHover.bind(this, this.props.chartData),
      },
    };
    const chartData = {
      datasets: [{
        data: this.props.chartData.data,
        backgroundColor: this.props.chartData.colors,
      }],
    };

    return (
      <section className={`chart-doughnut__section`}>
        <div className="chart-doughnut__container">
          <Doughnut
            ref={ (ref) => this.chartInstance = ref }
            data={ chartData }
            options={ chartOptions } />
        </div>
      </section>
    );
  }
}

DoughnutChart.propTypes = {
  chartData: PropTypes.object,
  chartName: PropTypes.string,
  renderOnLoad: PropTypes.bool,
  handleChartHover: PropTypes.func,
};