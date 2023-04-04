import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { catchError, Observable, Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { DisService } from 'src/app/services/dis.service';
import { LikeService } from 'src/app/services/like.service';
import { Comment } from '../../models/comment/comment';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.sass']
})


export class CommentComponent implements OnInit, OnDestroy {




    @Input() public comment: Comment;
    @Input() public currentUser: User;
    @Output() commentEdited = new EventEmitter<Comment>();
    @Output() commentDeleted = new EventEmitter<number>();
    @Output() disCommentCurrentUser = new EventEmitter<Comment>();
    @Output() likeCommentCurrentUser = new EventEmitter<Comment>();
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (!this._elementRef.nativeElement.contains(event.target)) {
            this.editing = false;
            this.comment.body = this.originalComment.body;
            this.hideLikeUserComponent();
            this.hideDisUserComponent();


        }
    }
    private unsubscribe$ = new Subject<void>();
    public constructor(
        private _elementRef: ElementRef,
        private disService: DisService,
        private likeService: LikeService
    ) { }

    public editing: Boolean;
    public originalComment: Comment;
    public showLikeUser = false;
    public showDisUser = false;
    public showLikeButton = false;
    public showDisButton = false;

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }


    ngOnInit(): void {
        this.editing = false;
        this.originalComment = { ...this.comment };

    }

    public Edit() {
        this.editing = true;
    }


    public Delete() {
        this.commentDeleted.emit(this.comment.id)
    }

    editComment() {

        this.commentEdited.emit(this.comment)
    }

    public disComment() {
        if (!this.currentUser) {
            this.disCommentCurrentUser.emit(this.comment)
        } else {
            this.disService
                .dis(this.comment, this.currentUser)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((comment) => (this.comment = comment as Comment));
            if (this.comment.reactions.length === 0) {
                this.hideLikeUserComponent()
            }
            if (this.comment.disreactions.length === 0) {
                this.hideDisUserComponent()
            }
        }
    }

    public likeComment() {
        if (!this.currentUser) {
            this.likeCommentCurrentUser.emit(this.comment)
        } else {
            this.likeService
                .like(this.comment, this.currentUser)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((comment) => (this.comment = comment as Comment));
            if (this.comment.reactions.length === 0) {
                this.hideLikeUserComponent()
            }
            if (this.comment.disreactions.length === 0) {
                this.hideDisUserComponent()
            }

        }


    }

    hideLikeUserComponent() {
        this.showLikeUser = false;
    }

    hideDisUserComponent() {
        this.showDisUser = false;
    }


}
