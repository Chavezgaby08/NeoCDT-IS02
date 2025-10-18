  test('renderiza y permite filtrar por estado', async () => {
    renderWithRouter();

    expect(screen.getByText(/mis solicitudes cdt/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/borrador/i)).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'En validación' } });

    await waitFor(() => {
      expect(screen.queryByText(/borrador/i)).not.toBeInTheDocument();
    });

    const matches = screen.getAllByText(/en validación/i);
    expect(matches.length).toBeGreaterThan(0);
  });
