import Admin_Home from './component/admin_compo/Admin_Home.js'
import Create_venue from './component/admin_compo/Create_venue.js'
import Edit_venue from './component/admin_compo/Edit_venue.js'
import Create_show from './component/admin_compo/Create_show.js'
import Edit_show from './component/admin_compo/Edit_show.js'
import Export_Data from './component/admin_compo/Export_Data.js'

import User_Home from './component/users_compo/User_Home.js'
import Book_show from './component/users_compo/Book_show.js'
import Bookings from './component/users_compo/Bookings.js'

const routes = [
  { path: '/', component: Admin_Home },
  { path: '/create_venue', component: Create_venue },
  { path: '/edit_venue', component: Edit_venue, name:'edit_venue'},
  { path: '/create_show', component: Create_show, name:'create_show' },
  { path: '/edit_show', component: Edit_show, name:'edit_show' },
  { path: '/export_data', component: Export_Data },

  { path: '/user_home', component: User_Home },
  { path: '/book_show', component: Book_show, name:'book_show' },
  { path: '/bookings', component: Bookings, name:'bookings' },

  // {path:'/signup', component: Signup}
]

const router = new VueRouter({
  routes,
})

export default router
