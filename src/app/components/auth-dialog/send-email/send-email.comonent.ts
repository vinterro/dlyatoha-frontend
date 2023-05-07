import { Component, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogType } from 'src/app/models/common/auth-dialog-type';
import { AuthenticationService } from 'src/app/services/auth.service';
import { AuthDialogComponent } from '../auth-dialog.component';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../../models/user';
import { SnackBarService } from '../../../services/snack-bar.service';
import { AbstractControl, ValidatorFn } from '@angular/forms';






@Component({
    selector: 'app-send-email.comonent.html',
    templateUrl: './send-email.comonent.html',
    styleUrls: ['./send-email.comonent.sass']
})
export class SendEmailComponent implements OnDestroy {
    public dialogType = DialogType;
    private unsubscribe$ = new Subject<void>();


    public forgotPasswordForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email, this.dotValidator()]]

    });

    constructor(
        private dialogRef: MatDialogRef<SendEmailComponent>,
        private _elementRef: ElementRef,
        private snackBarService: SnackBarService,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private authService: AuthenticationService,

    ) { }

    public ngOnDestroy() {

        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public dotValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const valid = /.*\..*/.test(control.value);
            return valid ? null : { dot: true };
        };
    }
    // public onSubmit() {
    //     this.authService
    //         .login({ email: this.forgotPasswordForm.get('email').value, password: "22222123" })
    //         .pipe(takeUntil(this.unsubscribe$))
    //         .subscribe((response) => this.dialog.closeAll(), (error) => this.snackBarService.showErrorMessage(error));

    // }
    public onSubmit(): void {
        const email = this.forgotPasswordForm.get('email').value;

        console.log(email)
        this.authService
            .sendEmail(email)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (response) => this.dialog.closeAll(),
                (error) => this.snackBarService.showErrorMessage(error))

    }





    public close() {
        this.dialog.closeAll()
        const dialog = this.dialog.open(AuthDialogComponent, {
            data: { dialogType: this.dialogType.SignIn },
            minWidth: 300,
            autoFocus: true,
            backdropClass: 'dialog-backdrop',
            position: {
                top: '0'
            }
        });

        dialog
            .afterClosed()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((result: User) => {
                if (result) {
                    this.authService.setUser(result);
                }
            });

    }

}