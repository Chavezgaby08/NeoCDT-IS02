# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]: BN
  - heading "Bienvenido a BancoNex" [level=2] [ref=e7]
  - paragraph [ref=e8]: Ingresa a tu cuenta para gestionar tus inversiones
  - generic [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e11]: Correo electrónico
      - textbox "Correo electrónico" [ref=e12]:
        - /placeholder: Ingresa tu correo
    - generic [ref=e13]:
      - generic [ref=e14]: Contraseña
      - textbox "Contraseña" [ref=e15]:
        - /placeholder: Ingresa tu contraseña
    - button "Iniciar Sesión" [ref=e16] [cursor=pointer]
  - paragraph [ref=e17]:
    - text: ¿No tienes cuenta?
    - link "Regístrate aquí" [ref=e18] [cursor=pointer]:
      - /url: /register
```