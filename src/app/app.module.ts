import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { RouterModule } from '@angular/router';
import { AppRoutes } from './app.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MainThreadComponent } from './components/main-thread/main-thread.component';
import { PostComponent } from './components/post/post.component';
import { HomeComponent } from './components/home/home.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AuthDialogComponent } from './components/auth-dialog/auth-dialog.component';
import { CommentComponent } from './components/comment/comment.component';
import { MaterialComponentsModule } from './components/common/material-components.module';
import { EditComponent } from './components/edit/edit.component';
import { LikeUsersComponent } from './components/like-users/like-users.component';
import { DisUsersComponent } from './components/dis-users/dis-users.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SendEmailComponent } from './components/auth-dialog/send-email/send-email.comonent';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { SharePostComponent } from './components/post/share-post/share-post.comonent';


@NgModule({
    declarations: [AppComponent, MainThreadComponent, PostComponent, SharePostComponent, HomeComponent, UserProfileComponent, AuthDialogComponent, SendEmailComponent, ResetPasswordComponent, CommentComponent, EditComponent, LikeUsersComponent, DisUsersComponent],
    imports: [BrowserModule, BrowserAnimationsModule, HttpClientModule, MaterialComponentsModule, RouterModule.forRoot(AppRoutes), FormsModule, MatTooltipModule, CommonModule, ToastrModule.forRoot({
        positionClass: 'toast-center'
    }), ReactiveFormsModule],
    exports: [MaterialComponentsModule],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        [MainThreadComponent]
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
