import { Inject } from '@angular/core';
import { Component, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogType } from 'src/app/models/common/auth-dialog-type';

import { Subject, takeUntil } from 'rxjs';
import { User } from '../../../models/user';
import { SnackBarService } from '../../../services/snack-bar.service';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { PostService } from 'src/app/services/post.service';
import { AuthenticationService } from 'src/app/services/auth.service';











@Component({
    selector: 'app-share-post',
    templateUrl: './share-post.comonent.html',
    styleUrls: ['./share-post.comonent.sass']
})
export class SharePostComponent implements OnDestroy {
    public dialogType = DialogType;
    private unsubscribe$ = new Subject<void>();



    public forgotPasswordForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email, this.dotValidator()]]

    });

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<SharePostComponent>,
        private _elementRef: ElementRef,
        private snackBarService: SnackBarService,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private postService: PostService,

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
        this.postService
            .sendEmail(email, this.data.postId, this.data.userName)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (response) => this.close(),
                (error) => this.snackBarService.showErrorMessage(error))



    }

    public close() {
        this.dialogRef.close(false);
    }


}