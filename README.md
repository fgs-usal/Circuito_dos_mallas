# Circuito de Dos Mallas

Este proyecto es una aplicación web interactiva que simula un circuito eléctrico de dos mallas. Está diseñado para ayudar a visualizar y calcular las corrientes que fluyen a través de las diferentes ramas del circuito utilizando las leyes de Kirchhoff.

## Características

- **Interfaz Moderna**: Diseño atractivo utilizando principios de *glassmorphism* y un tema oscuro para mayor comodidad visual.
- **Configuración Dinámica**: Permite modificar los valores de las resistencias (R1, R2, R3) y las fuentes de voltaje (V1, V2).
- **Cálculo Automático**: Calcula en tiempo real las corrientes (I1, I2, I3) que atraviesan las distintas mallas del circuito al pulsar el botón "Calcular Corrientes".
- **Visualización en Canvas**: Dibuja el diagrama del circuito eléctrico en un `<canvas>` de HTML5, actualizando visualmente las flechas de dirección y el grosor según la magnitud y el sentido de las corrientes calculadas.

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica de la aplicación.
- **CSS3 (Vanilla)**: Estilos avanzados, animaciones, variables CSS y diseño adaptable (*responsive layout*).
- **JavaScript (Vanilla)**: Lógica del cálculo matemático (resolución de sistemas de ecuaciones de 2x2 por determinantes) y renderizado gráfico del circuito en el Canvas.

## Cómo usarlo

1. Clona este repositorio o descarga los archivos.
2. Abre el archivo `index.html` en tu navegador web moderno favorito.
3. Modifica los parámetros del circuito en el panel izquierdo (resistencias y voltajes).
4. Haz clic en "Calcular Corrientes" para ver los resultados numéricos y la actualización visual en el esquema del circuito.

## Autor

Desarrollado como material de apoyo didáctico para el estudio de circuitos eléctricos básicos.
