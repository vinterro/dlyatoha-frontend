import { Injectable, OnDestroy } from '@angular/core';
import { DialogType } from '../models/common/auth-dialog-type';
import { AuthDialogComponent } from '../components/auth-dialog/auth-dialog.component';
import { User } from '../models/user';
import { MatDialog } from '@angular/material/dialog';
import { map, takeUntil } from 'rxjs/operators';
import { AuthenticationService } from './auth.service';
import { Subscription, Subject } from 'rxjs';
import { EditComponent } from '../components/edit/edit.component';
import { Post } from '../models/post/post';

@Injectable({ providedIn: 'root' })
export class EditService implements OnDestroy {
    private unsubscribe$ = new Subject<void>();

    public constructor(private dialog: MatDialog, private authService: AuthenticationService) { }


    public openEdit(post: Post) {
        const edit = this.dialog.open(EditComponent, {
            data: {
                post: post
            },
            panelClass: 'my-dialog'

        });


        edit
            .afterClosed()
            .pipe(takeUntil(this.unsubscribe$))



    }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}

