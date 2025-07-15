'use client'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const data = [
  { name: 'Road', value: 400 },
  { name: 'Sanitation', value: 300 },
  { name: 'Electricity', value: 200 },
  { name: 'Water', value: 100 }
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

export default function CategoryPieChart() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full h-[400px] flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Complaints by Category</h2>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={40}
              outerRadius={80}
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconSize={10}
              wrapperStyle={{ fontSize: '14px' }} // Restored standard font
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
