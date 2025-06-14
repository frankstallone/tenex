'use client'

import React from 'react'
import { AreaChart, Area, XAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

interface TimelineChartProps {
  data: { time: string; count: number }[]
  chartConfig: ChartConfig
}

const TimelineChart: React.FC<TimelineChartProps> = ({ data, chartConfig }) => {
  return (
    <div className="min-h-[250px] flex-1">
      <ChartContainer config={chartConfig}>
        <AreaChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Area
            dataKey="count"
            type="natural"
            fill="var(--color-count)"
            fillOpacity={0.4}
            stroke="var(--color-count)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

export default TimelineChart
