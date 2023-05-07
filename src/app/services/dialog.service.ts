import { Injectable, OnDestroy } from '@angular/core';
import { DialogType } from '../models/common/auth-dialog-type';
import { AuthDialogComponent } from '../components/auth-dialog/auth-dialog.component';
import { User } from '../models/user';
import { MatDialog } from '@angular/material/dialog';
import { map, takeUntil } from 'rxjs/operators';
import { AuthenticationService } from './auth.service';
import { Subscription, Subject } from 'rxjs';
import { SendEmailComponent } from '../components/auth-dialog/send-email/send-email.comonent';
import { SharePostComponent } from '../components/post/share-post/share-post.comonent';

@Injectable({ providedIn: 'root' })
export class DialogService implements OnDestroy {
    private unsubscribe$ = new Subject<void>();

    public constructor(private dialog: MatDialog, private authService: AuthenticationService) { }

    public openShareDialog(postId: number, userName: string) {
        this.dialog.open(SharePostComponent, {
            minHeight: 275,
            autoFocus: true,
            backdropClass: 'dialog-backdrop',
            position: {
                top: '0'
            },
            data: {
                postId: postId,
                userName: userName

            }

        });
    }




    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
