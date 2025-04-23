import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface GradeDistribution {
  name: string;
  value: number;
  color: string;
}

interface ChartDistributionProps {
  data: GradeDistribution[];
}

export function ChartDistribution({ data }: ChartDistributionProps) {
  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444'];
  
  const renderCustomizedLabel = ({ 
    cx, 
    cy, 
    midAngle, 
    innerRadius, 
    outerRadius, 
    percent 
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-primary-800 p-2 border border-primary-600 rounded-md shadow-md">
          <p className="text-white font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="text-primary-300 text-xs">{`${(payload[0].payload.percent * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 bg-primary-700 rounded-xl border border-primary-600 p-4">
      <h3 className="text-lg font-medium text-primary-100 text-center mb-4">
        Fibrosis Grade Distribution
      </h3>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => <span className="text-primary-100">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
