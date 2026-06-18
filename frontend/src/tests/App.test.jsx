import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import LandingPage from '../pages/LandingPage';
import '@testing-library/jest-dom';

describe('Peaceful Mind Landing Page Unit Tests', () => {
  test('renders the landing page title correctly', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    
    // Check that title "Peaceful Mind" is rendered
    const titleElements = screen.getAllByText(/Peaceful Mind/i);
    expect(titleElements.length).toBeGreaterThan(0);
  });

  test('contains call to action links', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Verify presence of "Get Started" link
    const actionLink = screen.getByText(/Get Started/i);
    expect(actionLink).toBeInTheDocument();
  });
});
