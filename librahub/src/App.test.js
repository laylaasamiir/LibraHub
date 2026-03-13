import { render, screen } from '@testing-library/react';
import App from './App';
import Borrow from './Pages/Borrow';
import { Route } from 'react-router-dom';

<Route path="/borrow" element={<Borrow />}/>

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
