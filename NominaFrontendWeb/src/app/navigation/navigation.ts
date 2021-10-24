import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id: 'Menu_Configuracion',
        title: 'Configuración general',
        type: 'group',
        hidden: true,
        children: [
            {
                id: 'Menu_Configuracion_Ayuda',
                title: 'Ayuda',
                type: 'collapsable',
                icon: 'help',
                hidden: true,
                children: [
                    {
                        id: 'Menu_Configuracion_Ayuda_Articulos',
                        title: 'Artículos',
                        type: 'item',
                        url: '/ayuda/articulos',
                        hidden: true
                    },
                    {
                        id: 'Menu_Configuracion_Ayuda_Categorias',
                        title: 'Categorías',
                        type: 'item',
                        url: '/ayuda/categorias',
                        hidden: true
                    },

                ]
            },
            {
                id: 'Menu_Configuracion_Calendario',
                title: 'Calendario',
                type: 'item',
                icon: 'calendar_today',
                url: '/configuracion/calendario',
                hidden: true
            },
            {
                id: 'Menu_Configuracion_Catalogos',
                title: 'Catálogos',
                type: 'item',
                icon: 'library_books',
                url: '/configuracion/dashboard',
                hidden: true
            },

            {
                id: 'Menu_Configuracion_Compania',
                title: 'Compañía',
                type: 'collapsable',
                icon: 'location_city',
                hidden: true,
                children: [
                    {
                        id: 'Menu_Configuracion_Compania_Aniosdetrabajo',
                        title: 'Años de trabajo',
                        type: 'item',
                        url: '/configuracion/annos-trabajo',
                        hidden: true
                    },
                    {
                        id: 'Menu_Configuracion_Compania_Datosbasicos',
                        title: 'Datos básicos',
                        type: 'item',
                        url: '/configuracion/compania',
                        hidden: true
                    },

                ]
            },

            {
                id: 'Menu_Configuracion_Mantenimiento',
                title: 'Mantenimiento',
                type: 'collapsable',
                icon: 'build',
                hidden: true,
                children: [
                    {
                        id: 'Menu_Configuracion_Mantenimiento_Notificaciones',
                        title: 'Notificaciones',
                        type: 'item',
                        url: '/mantenimiento/notificaciones',
                        hidden: true
                    },
                    {
                        id: 'Menu_Configuracion_Mantenimiento_Tareasprogramadas',
                        title: 'Tareas programadas',
                        type: 'item',
                        url: '/mantenimiento/tareas-programadas',
                        hidden: true
                    },
                ]
            },

            {
                id: 'Menu_Configuracion_Parametrosdelsistema',
                title: 'Parámetros del sistema',
                type: 'item',
                icon: 'settings_input_component',
                url: '/configuracion/parametros',
                hidden: true
            },
            {
                id: 'Menu_Configuracion_Plantillas',
                title: 'Plantillas',
                type: 'collapsable',
                icon: 'insert_drive_file',
                hidden: true,
                children: [
                    {
                        id: 'Menu_Configuracion_Plantillas_Complementos',
                        title: 'Complementos',
                        type: 'item',
                        url: '/plantilla/complementos',
                        hidden: true
                    },
                    {
                        id: 'Menu_Configuracion_Plantillas_Firmas',
                        title: 'Firmas',
                        type: 'item',
                        url: '/firma-grupo-documentos',
                        hidden: true
                    },
                    {
                        id: 'Menu_Configuracion_Plantillas_Formatos',
                        title: 'Formatos',
                        type: 'item',
                        url: '/plantilla/documentos',
                        hidden: true
                    },

                ]
            },


        ]
    },
    {
        id: 'Menu_Personal',
        title: 'Administración de personal',
        type: 'group',
        hidden: true,
        children: [
            {
                id: 'Menu_Personal_CambioAdministradoras',
                title: 'Cambios de administradoras',
                type: 'item',
                icon: 'dvr',
                url: '/administracion-personal/cambio-administradora',
                hidden: true
            },
            {
                id: 'Menu_Personal_CambioCentroTrabajos',
                title: 'Cambios centro de trabajos',
                type: 'item',
                icon: 'ballot',
                url: '/administracion-personal/cambio-centro-trabajos',
                hidden: true
            },
            {
                id: 'Menu_Personal_Contratos',
                title: 'Contratos',
                type: 'item',
                icon: 'supervised_user_circle',
                url: '/administracion-personal/contratos',
                hidden: true
            },
            {
                id: 'Menu_Personal_Flujosdetrabajo',
                title: 'Flujos de trabajo',
                type: 'collapsable',
                icon: 'all_inclusive',
                hidden: true,
                children: [
                    {
                        id: 'Menu_Personal_Flujosdetrabajo_Reemplazos',
                        title: 'Reemplazos',
                        type: 'item',
                        url: '/flujo-trabajos/sustitutos',
                        hidden: true
                    },
                    {
                        id: 'Menu_Personal_Flujosdetrajo_Aprobaciones',
                        title: 'Vistos buenos',
                        type: 'item',
                        url: '/flujo-trabajos/vistos-buenos',
                        hidden: true
                    },
                ]
            },
            {
                id: 'Menu_Personal_Funcionarios',
                title: 'Funcionarios',
                type: 'item',
                icon: 'people',
                url: '/administracion-personal/funcionarios',
                hidden: true
            },
            {
                id: 'Menu_Personal_Solicitudanticipodecesantias',
                title: 'Solicitud anticipo de cesantías',
                type: 'item',
                icon: 'attach_money',
                url: '/administracion-personal/solicitud-cesantias',
                hidden: true
            },
            // {
            //     id: 'administracion-personal-sustitutos',
            //     title: 'Reemplazos vistos buenos',
            //     type: 'item',
            //     icon: 'device_hub',
            //     url: '/administracion-personal/sustitutos'
            // },
            {
                id: 'Menu_Personal_Solicituddepermisos',
                title: 'Solicitud de permisos',
                type: 'item',
                icon: 'speaker_notes',
                url: '/administracion-personal/permisos',
                hidden: true
            },
            {
                id: 'Menu_Personal_Vacaciones',
                title: 'Vacaciones',
                type: 'collapsable',
                icon: 'flight_takeoff',
                hidden: true,
                children: [
                    {
                        id: 'Menu_Personal_Vacaciones_Librodevacaciones',
                        title: 'Libro de vacaciones',
                        type: 'item',
                        url: '/vacaciones/libro',
                        hidden: true
                    },
                    {
                        id: 'Menu_Personal_Vacaciones_Solicituddevacaciones',
                        title: 'Solicitudes de vacaciones',
                        type: 'item',
                        url: '/vacaciones/solicitudes',
                        hidden: true
                    },
                ]
            },
        ]
    },
    {
        id: 'Menu_Desarrollo',
        title: 'Desarrollo talento humano',
        type: 'group',
        hidden: true,
        children: [
            {
                id: 'Menu_Desarrollo_Beneficioscorporativos',
                title: 'Beneficios corporativos',
                type: 'item',
                icon: 'trending_up',
                url: '/desarrollo-th/beneficios',
                hidden: true
            },

        ]
    },
    {
        id: 'Menu_Nomina',
        title: 'Nómina',
        type: 'group',
        hidden: true,
        children: [
            {
                id: 'Menu_Nomina_Conceptos',
                title: 'Conceptos',
                type: 'item',
                icon: 'exposure',
                url: '/nomina/concepto-nominas',
                hidden: true
            },
            {
                id: 'Menu_Nomina_Distribuciondecostos',
                title: 'Distribución de costos',
                type: 'item',
                icon: 'equalizer',
                url: '/nomina/distribucion-costos',
                hidden: true
            },
            {
                id: 'Menu_Nomina_Liquidaciones',
                title: 'Liquidaciones',
                type: 'item',
                icon: 'monetization_on',
                url: '/nomina/liquidacion-nomina',
                hidden: true
            },
            {
                id: 'Menu_Nomina_ProcesarCostos',
                title: 'Procesar costos',
                type: 'item',
                icon: 'event_note',
                url: '/nomina/proceso-costos',
                hidden: true
            },
            {
                id: 'Menu_Nomina_Tiposdeliquidacion',
                title: 'Tipos de liquidación',
                type: 'item',
                icon: 'list_alt',
                url: '/nomina/tipo-liquidaciones',
                hidden: true
            },

        ]
    },
    {
        id: 'Menu_Novedades',
        title: 'Novedades',
        type: 'group',
        hidden: true,
        children: [
            {
                id: 'Menu_Novedades_Ausentismos',
                title: 'Ausentismos',
                type: 'item',
                icon: 'nature_people',
                url: '/novedades/ausentismos',
                hidden: true
            },
            {
                id: 'Menu_Novedades_Embargos',
                title: 'Embargos',
                type: 'item',
                icon: 'money_off',
                url: '/novedades/embargos',
                hidden: true
            },
            {
                id: 'Menu_Novedades_Gastosdeviaje',
                title: 'Gastos de viaje',
                type: 'item',
                icon: 'airplanemode_active',
                url: '/novedades/gastos-viaje',
                hidden: true
            },
            {
                id: 'Menu_Novedades_Horasextras',
                title: 'Horas extras',
                type: 'item',
                icon: 'add_alarm',
                url: '/novedades/hora-extras',
                hidden: true
            },
            {
                id: 'Menu_Novedades_Libranzas',
                title: 'Libranzas',
                type: 'item',
                icon: 'trending_down',
                url: '/novedades/libranzas',
                hidden: true
            },
            {
                id: 'Menu_Novedades_Otrasnovedades',
                title: 'Otras novedades',
                type: 'item',
                icon: 'add_circle_outline',
                url: '/novedades/otra-novedades',
                hidden: true
            },

        ]
    },
    {
        id: 'Menu_Seleccion',
        title: 'Selección de personal',
        type: 'group',
        hidden: true,
        children: [
            {
                id: 'Menu_SeleccionDePersonal_Requisiciones',
                title: 'Requisiciones',
                type: 'item',
                icon: 'person_add',
                url: '/reclutamiento-seleccion/requisiciones-personal',
                hidden: true
            },
            {
                id: 'Menu_SeleccionDePersonal_HojasDeVida',
                title: 'Hojas de vida',
                type: 'item',
                icon: 'account_box',
                url: '/reclutamiento-seleccion/hojas-vida',
                hidden: true
            },

        ]
    },
    {
        id: 'Menu_Reportes',
        title: 'Reportes',
        type: 'group',
        hidden: true,
        children: [
            {
                id: 'Menu_Reportes_Personal',
                title: 'Administración de personal',
                type: 'item',
                icon: 'person_pin',
                url: '/reportes/administracion-personal/dashboard',
                hidden: true
            },
            {
                id: 'Menu_Reportes_Desarrollo',
                title: 'Desarrollo del talento humano',
                type: 'item',
                icon: 'chrome_reader_mode',
                url: '/reportes/desarrollo-talento-humano/dashboard',
                hidden: true
            },
            {
                id: 'Menu_Reportes_Nomina',
                title: 'Nómina',
                type: 'item',
                icon: 'folder_shared',
                url: '/reportes/nomina/dashboard',
                hidden: true
            },
            {
                id: 'Menu_Reportes_Seguridad',
                title: 'Seguridad y salud',
                type: 'item',
                icon: 'local_hospital',
                url: '/reportes/seguridad-salud/dashboard',
                hidden: true
            },
            {
                id: 'Menu_Reportes_Seleccion',
                title: 'Selección de personal',
                type: 'item',
                icon: 'accessibility',
                url: '/reportes/seleccion-personal/dashboard',
                hidden: true
            },
        ]
    },
];
