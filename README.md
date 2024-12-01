## Proyecto: Asistente Inteligente para Consumidores en Resolución de Conflictos Online

## Descripción 
El proyecto se concibe como una iniciativa con un modelo de propuesta cuyo objetivo es ofrecer una asistencia para la resolución de conflictos, especialmente para los consumidores. Busca eliminar las dificultades que enfrentan cuando deben hacer frente a entidades con más recursos y conocimientos sobre la justicia chilena, como son los altos costos de litigación y la falta de conocimiento sobre las leyes. 

Este asistente inteligente utiliza el modelo de MetaAI como inteligencia artificial y procesamiento de lenguaje natural para guiar a los usuarios a través del proceso legal, ofreciendo Recomendaciones, Concluciones, y Leyes relacionadas al caso proporcionado. Con un enfoque accesible y amigable, se busca una entrada al conocimiento sobre el acceso a la justicia y empoderar a los consumidores para que puedan defender sus derechos de manera efectiva y eficiente.

##### Pasos a seguir para clonar el repositorio:
- Clonar el repositorio en su PC.
`git clone https://github.com/SteveManfred/proyecto_asistencia_digital.git`
- Creación del Entorno Virtual > Miniconda.
`conda create -n entorno-litigio python=3.10`  
- Activación:
`conda activate entorno-litigio`  
- Instalación de requerimientos.
`pip install -r requirements.txt`  
- Comprobar Instalación.
`pip list`  

##### Pasos a seguir para ejecutar la pagina:
- Configurar 'settings.py' con los datos de la base de datos. 

- Preparar las migraciones.
`python manage.py makemigrations`  

- Ejecutar las migraciones.
`python manage.py migrate`  

- Crear un superusuario.
`python manage.py createsuperuser`
Seguir los pasos (nombre, correo, clave, etc.)

- Iniciar Aplicación.
`python manage.py runserver`

------------
#### Logo
#
## Screenshots
#
#### Diagrama de Sistema
#
#### Home
# 
#### Login
#
### Administrator
# 
### Create User
# 
------------


