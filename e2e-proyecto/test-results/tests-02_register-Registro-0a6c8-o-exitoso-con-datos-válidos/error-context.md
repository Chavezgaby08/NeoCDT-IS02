# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]: BN
  - heading "Crear Cuenta en BancoNex" [level=2] [ref=e7]
  - paragraph [ref=e8]: Completa tus datos para registrarte
  - generic [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e11]: Nombre Completo
      - textbox "Nombre Completo" [ref=e12]:
        - /placeholder: Juan Pérez
    - generic [ref=e13]:
      - generic [ref=e14]: Correo electrónico
      - textbox "Correo electrónico" [ref=e15]:
        - /placeholder: juan@example.com
    - generic [ref=e16]:
      - generic [ref=e17]: Cédula
      - textbox "Cédula" [ref=e18]:
        - /placeholder: "1234567890"
    - generic [ref=e19]:
      - generic [ref=e20]: Teléfono
      - textbox "Teléfono" [ref=e21]:
        - /placeholder: "3001234567"
    - generic [ref=e22]:
      - generic [ref=e23]: Contraseña
      - textbox "Contraseña" [ref=e24]:
        - /placeholder: Mínimo 6 caracteres
    - generic [ref=e25]:
      - generic [ref=e26]: Confirmar Contraseña
      - textbox "Confirmar Contraseña" [ref=e27]:
        - /placeholder: Repite tu contraseña
    - button "Registrarse" [ref=e28] [cursor=pointer]
  - paragraph [ref=e29]:
    - text: ¿Ya tienes cuenta?
    - link "Inicia sesión" [ref=e30] [cursor=pointer]:
      - /url: /login
```