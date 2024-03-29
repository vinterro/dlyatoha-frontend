import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DialogType } from '../../models/common/auth-dialog-type';
import { Subject } from 'rxjs';
import { AuthenticationService } from '../../services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { SnackBarService } from '../../services/snack-bar.service';
import { EventService } from 'src/app/services/event.service';
import { SendEmailComponent } from './send-email/send-email.comonent';
import { AuthDialogService } from 'src/app/services/auth-dialog.service';

@Component({
    templateUrl: './auth-dialog.component.html',
    styleUrls: ['./auth-dialog.component.sass']
})
export class AuthDialogComponent implements OnInit, OnDestroy {
    public dialogType = DialogType;
    public authDialogServ: AuthDialogService;
    public userName: string;
    public password: string;
    public avatar: string;
    public email: string;

    public hidePass = true;
    public title: string;
    private unsubscribe$ = new Subject<void>();

    constructor(
        private dialogRef: MatDialogRef<AuthDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private authService: AuthenticationService,
        private snackBarService: SnackBarService,
        private dialog: MatDialog,
        private eventService: EventService
    ) { }

    public ngOnInit() {
        this.avatar = 'https://avatars.mds.yandex.net/get-ott/374297/2a000001616b87458162c9216ccd5144e94d/orig';
        this.title = this.data.dialogType === DialogType.SignIn ? 'Sign In' : 'Sign Up';
    }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public close() {
        this.dialogRef.close(false);
    }

    public signIn() {
        this.authService
            .login({ email: this.email, password: this.password })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response) => this.dialogRef.close(response), (error) => this.snackBarService.showUsualMessage(error));

    }

    public signUp() {
        this.authService
            .register({ userName: this.userName, password: this.password, email: this.email, avatar: this.avatar })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response) => this.dialogRef.close(response), (error) => this.snackBarService.showErrorMessage(error));

    }

    public ForgotPass() {
        this.dialogRef.close()
        this.dialog.open(SendEmailComponent, {
            minHeight: 275,
            autoFocus: true,
            backdropClass: 'dialog-backdrop',
            position: {
                top: '0'
            }

        });
    }
}
