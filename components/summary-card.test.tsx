import React from 'react'
import { render, screen } from '@testing-library/react'
import { SummaryCard } from './summary-card'
import { AlertCircle } from 'lucide-react'

describe('SummaryCard', () => {
  it('renders the title and value', () => {
    render(<SummaryCard title="Test Title" value={123} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('123')).toBeInTheDocument()
  })

  it('renders the icon when provided', () => {
    render(<SummaryCard title="With Icon" value="abc" icon={AlertCircle} />)
    // Check if the SVG is rendered by looking for its title or a test-id
    // Since lucide-react icons don't have a default accessible name, we check if it's in the document.
    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('applies the valueClassName to the value', () => {
    render(
      <SummaryCard
        title="Styled Value"
        value={456}
        valueClassName="text-blue-500"
      />
    )
    const valueElement = screen.getByText('456')
    expect(valueElement).toHaveClass('text-blue-500')
  })
})
