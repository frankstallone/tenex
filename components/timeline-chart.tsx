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
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-count)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-count)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
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
            fill="url(#colorGradient)"
            stroke="var(--color-count)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

export default TimelineChart
