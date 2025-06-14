'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

interface AnomalyBreakdownChartProps {
  data: {
    name: string
    total: number
  }[]
  chartConfig: ChartConfig
}

const AnomalyBreakdownChart: React.FC<AnomalyBreakdownChartProps> = ({
  data,
  chartConfig,
}) => {
  return (
    <div className="min-h-[250px] flex-1">
      <ChartContainer config={chartConfig}>
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="total" fill="var(--color-total)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}

export default AnomalyBreakdownChart
