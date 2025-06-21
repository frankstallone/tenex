import { LucideIcon } from 'lucide-react'
import React from 'react'

/**
 * Props for the SummaryCard component.
 * @interface SummaryCardProps
 * @property {string} title - The title text to display in the card header
 * @property {string | number} value - The main value to display in the card
 * @property {LucideIcon} [icon] - Optional Lucide icon component to display in the header
 * @property {string} [valueClassName] - Optional CSS class names to apply to the value text
 */
interface SummaryCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  valueClassName?: string
}

/**
 * A card component for displaying summary metrics or statistics.
 *
 * This component creates a consistent card layout for displaying summary information,
 * with an optional icon in the header and customizable value styling. It's designed
 * to be used in dashboard grids or metric displays.
 *
 * @component
 * @param {SummaryCardProps} props - The component props
 * @returns {JSX.Element} The rendered card
 *
 * @example
 * ```tsx
 * <SummaryCard
 *   title="Total Users"
 *   value={1234}
 *   icon={UserIcon}
 *   valueClassName="text-blue-500"
 * />
 * ```
 */
export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon: Icon,
  valueClassName,
}) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <header className="flex flex-row items-center justify-between space-y-0 text-muted-foreground">
        <div className="text-sm font-medium">{title}</div>
        {Icon && <Icon className="h-4 w-4" />}
      </header>
      <div>
        <div className={`text-4xl font-semibold ${valueClassName}`}>
          {value}
        </div>
      </div>
    </div>
  )
}
