import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SolicitudForm from '../components/SolicitudForm.jsx';

describe('SolicitudForm', () => {
  test('valida y llama onSubmit con datos numéricos', async () => {
    const onSubmit = jest.fn().mockResolvedValue();
    const onClose = jest.fn();

    render(<SolicitudForm onSubmit={onSubmit} onClose={onClose} />);

    const montoInput = screen.getByLabelText(/monto a invertir/i);
    const plazoInput = screen.getByLabelText(/plazo \(días\)/i);
    const tasaInput  = screen.getByLabelText(/tasa de interés/i);
    const submitBtn  = screen.getByRole('button', { name: /crear solicitud/i });

    await userEvent.clear(montoInput);
    await userEvent.type(montoInput, '1000000');
    await userEvent.clear(plazoInput);
    await userEvent.type(plazoInput, '90');
    await userEvent.clear(tasaInput);
    await userEvent.type(tasaInput, '10.5');

    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      monto: 1000000,
      plazo: 90,
      estado: 'Borrador',
      tasaInteres: 10.5,
    });
  });
});
