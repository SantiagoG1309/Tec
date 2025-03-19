#!/bin/bash

# Verificar si Python está instalado
if ! command -v python &> /dev/null; then
    echo "Python no está instalado. Por favor, instálalo antes de continuar."
    exit 1
fi

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Node.js no está instalado. Por favor, instálalo antes de continuar."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "npm no está instalado. Por favor, instálalo antes de continuar."
    exit 1
fi

# Verificar si Angular CLI está instalado
if ! command -v ng &> /dev/null; then
    echo "Angular CLI no está instalado. Instalando..."
    npm install -g @angular/cli
fi

# Crear entorno virtual de Python si no existe
if [ ! -d "venv" ]; then
    echo "Creando entorno virtual de Python..."
    python -m venv venv
fi

# Activar entorno virtual
source venv/bin/activate || source venv/Scripts/activate

# Instalar dependencias de Python
echo "Instalando dependencias de Python..."
pip install -r backend/requirements.txt

# Instalar dependencias de Node.js
echo "Instalando dependencias de Node.js..."
cd frontend && npm install && cd ..

# Aplicar migraciones de Django
echo "Aplicando migraciones de Django..."
cd backend
python manage.py makemigrations
python manage.py migrate

# Crear superusuario si no existe
echo "Verificando si existe un superusuario..."
python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ticketsystem.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('Creando superusuario...')
    User.objects.create_superuser('admin', 'admin@example.com', 'admin', user_type='admin')
    print('Superusuario creado con éxito.')
else:
    print('El superusuario ya existe.')
"

# Iniciar backend y frontend en paralelo
echo "Iniciando el sistema..."
cd ..
(cd backend && python manage.py runserver) & 
(cd frontend && ng serve --open)

# Esperar a que ambos procesos terminen
wait

