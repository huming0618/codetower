// import Dashboard from '@/home/components/Dashboard';
// const Task = () => import('@/admin/components/task')
// const Examine = () => import('@/admin/components/Examine')
// const ApplyReward = () => import("@/mytoken/components/ApplyReward")
// import LoginPage from './login'
const createProject = () => import("../project/create")
const viewProject = () => import("../project/view")

const routes = [{
        path: '/',
        name: 'createProject',
        component: createProject
    },
    {
        path: '/project/auth/',
        name: 'viewProject',
        component: viewProject
    },
    // {
    //     path: '/applyreward',
    //     name: 'ApplyReward',
    //     component: ApplyReward
    // },
    // {
    //     path: '/examine',
    //     name: 'Examine',
    //     component: Examine
    // }
];

export default routes;