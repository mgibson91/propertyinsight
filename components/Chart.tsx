// src/components/Chart.tsx
import { FC } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface ChartProps {
  series: ApexAxisChartSeries;
}

const Chart: FC<ChartProps> = ({ series }) => {
  const options: ApexOptions = {
    chart: {
      type: 'candlestick',
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="candlestick"
      height={350}
    />
  );
};

export default Chart;
