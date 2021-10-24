import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id: 'configuracion-general',
        title: 'Configuración general',
        type: 'group',
        children: [
            {
                id: 'configuracion-general-Aprobaciones',
                title: 'Aprobaciones y autorizaciones',
                type: 'item',
                icon: 'playlist_add_check',
                url: '/configuracion/aprobaciones'
            },
            {
                id: 'configuracion-general-ayuda',
                title: 'Ayuda',
                type: 'collapsable',
                icon: 'help',
                children: [
                    {
                        id: 'articulos-ayuda',
                        title: 'Artículos',
                        type: 'item',
                        url: '/ayuda/articulos'
                    },
                    {
                        id: '',
                        title: 'Categorías',
                        type: 'item',
                        url: '/ayuda/categorias'
                    },

                ]
            },
            {
                id: 'configuracion-general-calendario',
                title: 'Calendario',
                type: 'item',
                icon: 'calendar_today',
                url: '/configuracion/calendario'
            },
            {
                id: 'configuracion-general-catalogos',
                title: 'Catálogos',
                type: 'item',
                icon: 'library_books',
                url: '/configuracion/dashboard'
            },

            {
                id: 'configuracion-general-compania',
                title: 'Compañía',
                type: 'collapsable',
                icon: 'location_city',
                children: [
                    {
                        id: '',
                        title: 'Años de trabajo',
                        type: 'item',
                        url: '/configuracion/annos-trabajo'
                    },
                    {
                        id: '',
                        title: 'Datos básicos',
                        type: 'item',
                        url: '/configuracion/compania'
                    },
                    
                ]
            },

            {
                id: 'configuracion-general-mantenimiento',
                title: 'Mantenimiento',
                type: 'collapsable',
                icon: 'build',
                children: [
                    {
                        id: '',
                        title: 'Notificaciones',
                        type: 'item',
                        url: '/mantenimiento/notificaciones'
                    },
                    {
                        id: '',
                        title: 'Tareas programadas',
                        type: 'item',
                        url: '/mantenimiento/tareas-programadas'
                    },
                ]
            },

            {
                id: 'configuracion-general-parametros',
                title: 'Parámetros del sistema',
                type: 'item',
                icon: 'settings_input_component',
                url: '/configuracion/parametros'
            },
            {
                id: 'configuracion-general-plantilla',
                title: 'Plantillas',
                type: 'collapsable',
                icon: 'insert_drive_file',
                children: [
                    {
                        id: '',
                        title: 'Complementos',
                        type: 'item',
                        url: '/plantilla/complementos'
                    },
                    {
                        id: '',
                        title: 'Firmas',
                        type: 'item',
                        url: '/firma-grupo-documentos'
                    },
                    {
                        id: '',
                        title: 'Formatos',
                        type: 'item',
                        url: '/plantilla/documentos'
                    },

                ]
            },


        ]
    },
    {
        id: 'administracion-personal',
        title: 'Administración de personal',
        type: 'group',
        children: [


            {
                id: 'administracion-personal-contratos',
                title: 'Contratos',
                type: 'item',
                icon: 'supervised_user_circle',
                url: '/administracion-personal/contratos'
            },
            {
                id: 'administracion-personal-flujo-trabajos',
                title: 'Flujos de trabajo',
                type: 'collapsable',
                icon: 'all_inclusive',
                children: [
                    {
                        id: '',
                        title: 'Reemplazos',
                        type: 'item',
                        url: '/flujo-trabajos/sustitutos'
                    },
                    {
                        id: '',
                        title: 'Vistos buenos',
                        type: 'item',
                        url: '/flujo-trabajos/vistos-buenos'
                    },
                ]
            },
            {
                id: 'administracion-personal-funcionarios',
                title: 'Funcionarios',
                type: 'item',
                icon: 'people',
                url: '/administracion-personal/funcionarios'
            },
            {
                id: 'administracion-personal-solicitud-cesantias',
                title: 'Solicitud anticipo de cesantías',
                type: 'item',
                icon: 'attach_money',
                url: '/administracion-personal/solicitud-cesantias'
            },
            // {
            //     id: 'administracion-personal-sustitutos',
            //     title: 'Reemplazos vistos buenos',
            //     type: 'item',
            //     icon: 'device_hub',
            //     url: '/administracion-personal/sustitutos'
            // },
            {
                id: 'administracion-personal-permisos',
                title: 'Solicitud de permisos',
                type: 'item',
                icon: 'speaker_notes',
                url: '/administracion-personal/permisos'
            },
            {
                id: 'administracion-personal-vacaciones',
                title: 'Vacaciones',
                type: 'collapsable',
                icon: 'flight_takeoff',
                children: [
                    {
                        id: '',
                        title: 'Libro de vacaciones',
                        type: 'item',
                        url: '/vacaciones/libro'
                    },
                    {
                        id: '',
                        title: 'Solicitudes de vacaciones',
                        type: 'item',
                        url: '/vacaciones/solicitudes'
                    },
                ]
            },
        ]
    },
    {
        id: 'desarrollo-th',
        title: 'Desarrollo talento humano',
        type: 'group',
        children: [
            {
                id: 'desarrollo-th-beneficios',
                title: 'Beneficios corporativos',
                type: 'item',
                icon: 'trending_up',
                url: '/desarrollo-th/beneficios'
            },

        ]
    },
    {
        id: 'nomina',
        title: 'Nómina',
        type: 'group',
        children: [
            {
                id: 'nomina-concepto-nominas',
                title: 'Conceptos',
                type: 'item',
                icon: 'exposure',
                url: '/nomina/concepto-nominas'
            },
            {
                id: 'nomina-distribucion-costos',
                title: 'Distribución de costos',
                type: 'item',
                icon: 'equalizer',
                url: '/nomina/distribucion-costos'
            },
            {
                id: 'nomina-liquidaciones',
                title: 'Liquidaciones',
                type: 'item',
                icon: 'monetization_on',
                url: '/nomina/liquidacion-nomina'
            },

            {
                id: 'nomina-tipo-liquidacion',
                title: 'Tipos de liquidación',
                type: 'item',
                icon: 'list_alt',
                url: '/nomina/tipo-liquidaciones'
            },

        ]
    },
    {
        id: 'novedades',
        title: 'Novedades',
        type: 'group',
        children: [
            {
                id: 'novedades-ausentismos',
                title: 'Ausentismos',
                type: 'item',
                icon: 'nature_people',
                url: '/novedades/ausentismos'
            },
            {
                id: 'novedades-embargos',
                title: 'Embargos',
                type: 'item',
                icon: 'money_off',
                url: '/novedades/embargos'
            },
            {
                id: 'gastos-viaje',
                title: 'Gastos de viaje',
                type: 'item',
                icon: 'airplanemode_active',
                url: '/novedades/gastos-viaje'
            },
            {
                id: 'novedades-hora-extras',
                title: 'Horas extras',
                type: 'item',
                icon: 'add_alarm',
                url: '/novedades/hora-extras'
            },
            {
                id: 'novedades-libranzas',
                title: 'Libranzas',
                type: 'item',
                icon: 'trending_down',
                url: '/novedades/libranzas'
            },
            {
                id: 'novedades-otra-novedades',
                title: 'Otras novedades',
                type: 'item',
                icon: 'add_circle_outline',
                url: '/novedades/otra-novedades'
            },
            
        ]
    },
    {
        id: 'reclutamiento-seleccion',
        title: 'Selección de personal',
        type: 'group',
        children: [
            {
                id: 'requisicion-personal',
                title: 'Requisiciones',
                type: 'item',
                icon: 'person_add',
                url: '/reclutamiento-seleccion/requisiciones-personal'
            },
            {
                id: 'hojas-vida',
                title: 'Hojas de vida',
                type: 'item',
                icon: 'account_box',
                url: '/reclutamiento-seleccion/hojas-vida'
            },

        ]
    },
    {
        id: 'reportes',
        title: 'Reportes',
        type: 'group',
        children: [
            {
                id: 'reportes-administracion-personal',
                title: 'Administración de personal',
                type: 'item',
                icon: 'person_pin',
                url: '/reportes/administracion-personal/dashboard'
            },
            {
                id: 'reportes-desarrollo-talento-humano',
                title: 'Desarrollo del talento humano',
                type: 'item',
                icon: 'chrome_reader_mode',
                url: '/reportes/desarrollo-talento-humano/dashboard'
            },
            {
                id: 'reportes-nomina',
                title: 'Nómina',
                type: 'item',
                icon: 'folder_shared',
                url: '/reportes/nomina/dashboard'
            },
            {
                id: 'reportes-seguridad-salud',
                title: 'Seguridad y salud',
                type: 'item',
                icon: 'local_hospital',
                url: '/reportes/seguridad-salud/dashboard'
            },
            {
                id: 'reportes-seleccion-personal',
                title: 'Selección de personal',
                type: 'item',
                icon: 'accessibility',
                url: '/reportes/seleccion-personal/dashboard'
            },
        ]
    },
];
