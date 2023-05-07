import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { MainThreadComponent } from './components/main-thread/main-thread.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { PostComponent } from './components/post/post.component';

export const AppRoutes: Routes = [
    { path: '', component: MainThreadComponent, pathMatch: 'full' },
    { path: 'thread', component: MainThreadComponent, pathMatch: 'full' },
    { path: 'profile', component: UserProfileComponent, pathMatch: 'full', canActivate: [AuthGuard] },
    { path: 'reset-password', component: ResetPasswordComponent, pathMatch: 'full' },
    { path: 'posts/:id', component: MainThreadComponent, pathMatch: 'full' }
];
