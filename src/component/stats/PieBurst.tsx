import ReactECharts from 'echarts-for-react';
import { useState } from 'react';
import ZoomChart from "./ZoomChart";

interface PieBurstProps { }
export default function PieBurst({}: PieBurstProps) {

  const [full, setFull] = useState(false);
	const toggleFull = () => setFull(!full);

  const option = {

  }

  return (
    <ZoomChart full={full} toggleFull={toggleFull}>
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </ZoomChart>
  );
}