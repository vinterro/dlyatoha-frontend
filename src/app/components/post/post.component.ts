import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import { Post } from '../../models/post/post';
import { AuthenticationService } from '../../services/auth.service';
import { AuthDialogService } from '../../services/auth-dialog.service';
import { empty, Observable, Subject } from 'rxjs';
import { DialogType } from '../../models/common/auth-dialog-type';
import { LikeService } from '../../services/like.service';
import { NewComment } from '../../models/comment/new-comment';
import { CommentService } from '../../services/comment.service';
import { User } from '../../models/user';
import { Comment } from '../../models/comment/comment';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { SnackBarService } from '../../services/snack-bar.service';
import { DisService } from 'src/app/services/dis.service';
import { EditService } from 'src/app/services/Edit.service';
import { PostService } from 'src/app/services/post.service';
import { GyazoService } from 'src/app/services/gyazo.service';
import { SharePostComponent } from './share-post/share-post.comonent';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from 'src/app/services/dialog.service';



@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.sass']
})
export class PostComponent implements OnDestroy {
    @ViewChild('tooltipContent', { read: TemplateRef }) tooltipContent!: TemplateRef<any>;
    @Input() public post: Post;
    @Input() public currentUser: User;
    @Output() postDeleted = new EventEmitter<number>();
    @Output() postLiked = new EventEmitter<number>();
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (!this._elementRef.nativeElement.contains(event.target)) {
            this.hideLikeUserComponent();
            this.hideDisUserComponent();


        }

    }
    public showLikeButton = false;
    public showDisButton = false;
    public showLikeUser = false;
    public showDisUser = false;
    public showComments = false;
    public newComment = {} as NewComment;
    public newPost = {} as Post;
    public loading = false;

    private unsubscribe$ = new Subject<void>();

    public constructor(
        private dialog: MatDialog,
        private _elementRef: ElementRef,
        private authService: AuthenticationService,
        private authDialogService: AuthDialogService,
        private editService: EditService,
        private postService: PostService,
        private likeService: LikeService,
        private disService: DisService,
        private commentService: CommentService,
        private snackBarService: SnackBarService,
        private gyazoService: GyazoService,
        private dialogService: DialogService

    ) { }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public toggleComments() {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((user) => {
                    if (user) {
                        this.currentUser = user;
                        this.showComments = !this.showComments;
                    }
                });
            return;
        }

        this.showComments = !this.showComments;
    }

    public CommentLikereactNoUser(likecomment: Comment) {
        if (likecomment) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(
                    switchMap((userResp) => this.likeService.like(likecomment, userResp)),
                    takeUntil(this.unsubscribe$)
                )
                .subscribe((comment) => (likecomment = comment as Comment));


            return;
        }
    }

    public CommentDisreactNoUser(discomment: Comment) {
        if (discomment) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(
                    switchMap((userResp) => this.disService.dis(discomment, userResp)),
                    takeUntil(this.unsubscribe$)
                )
                .subscribe((comment) => (discomment = comment as Comment));


            return;
        }
    }



    public likePost() {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(
                    switchMap((userResp) => this.likeService.like(this.post, userResp)),
                    takeUntil(this.unsubscribe$)
                )
                .subscribe((post) => (this.post = post as Post),
                );
            if (this.post.reactions.length === 0) {
                this.hideLikeUserComponent()
            }
            if (this.post.disreactions.length === 0) {
                this.hideDisUserComponent()
            }

            return;
        }


        this.likeService
            .like(this.post, this.currentUser)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((post) => (this.post = post as Post));
        if (this.post.reactions.length === 0) {
            this.hideLikeUserComponent()
        }
        if (this.post.disreactions.length === 0) {
            this.hideDisUserComponent()
        }


    }


    public disPost() {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(
                    switchMap((userResp) => this.disService.dis(this.post, userResp)),
                    takeUntil(this.unsubscribe$)
                )
                .subscribe((post) => (this.post = post as Post));
            if (this.post.reactions.length === 0) {
                this.hideLikeUserComponent()
            }
            if (this.post.disreactions.length === 0) {
                this.hideDisUserComponent()
            }
            return;
        }




        this.disService
            .dis(this.post, this.currentUser)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((post) => (this.post = post as Post));
        if (this.post.reactions.length === 0) {
            this.hideLikeUserComponent()
        }
        if (this.post.disreactions.length === 0) {
            this.hideDisUserComponent()
        }

    }



    public sendComment() {
        this.newComment.authorId = this.currentUser.id;
        this.newComment.postId = this.post.id;

        this.commentService
            .createComment(this.newComment)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (resp) => {
                    if (resp) {
                        this.post.comments = this.sortCommentArray(this.post.comments.concat(resp.body));
                        this.newComment.body = undefined;
                    }
                },
                (error) => this.snackBarService.showErrorMessage(error)
            );
    }

    public openAuthDialog() {
        this.authDialogService.openAuthDialog(DialogType.SignIn);
    }

    private catchErrorWrapper(obs: Observable<User>) {
        return obs.pipe(
            catchError(() => {
                this.openAuthDialog();
                return empty();
            })
        );
    }

    private sortCommentArray(array: Comment[]): Comment[] {
        return array.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }


    public Edit() {
        this.editService.openEdit(this.post)
    }




    public Delete() {


        const deleteSubscription = this.postService.deletePost(this.post.id);

        this.loading = true;

        deleteSubscription.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (postIdResp) => {
                this.postDeleted.emit(postIdResp.body);
                this.loading = false;
                this.gyazoService.deleteImage('a35cceab312542319ee9ca60ad472e8a')

            },
            (error) => this.snackBarService.showErrorMessage(error)
        );
        console.log("deleted post");
    }



    hideLikeUserComponent() {
        this.showLikeUser = false;
    }

    hideDisUserComponent() {
        this.showDisUser = false;
    }

    editComment(comment: Comment) {
        const index = this.post.comments.findIndex(c => c.id === comment.id);
        if (index > -1) {
            this.post.comments[index] = comment;
            // this.post.comments = this.sortCommentArray(this.post.comments);
        }


    }

    deleteComment(deleteCommentId: number) {
        this.post.comments = this.post.comments.filter(comment => comment.id !== deleteCommentId);
    }
    public sendEditComment(comment: Comment) {
        // this.isOriginalPost = false;


        var commentSubcription = this.commentService.editComment(comment)



        this.loading = true;

        commentSubcription.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (respComment) => {
                this.editComment(respComment.body);


                this.loading = false;
            },
            (error) => this.snackBarService.showErrorMessage(error)
        );


    }

    public sendDeleteComment(commentId: number) {

        const deleteSubscription = this.commentService.deletePost(commentId);

        this.loading = true;

        deleteSubscription.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (commentIdResp) => {
                this.deleteComment(commentIdResp.body)
                this.loading = false;
            },
            (error) => this.snackBarService.showErrorMessage(error)
        );


    }

    public sharePost() {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(

                    takeUntil(this.unsubscribe$))
                .subscribe(() => true);





            return;
        }

        this.dialogService.openShareDialog(this.post.id, this.currentUser.userName)


    }


}
