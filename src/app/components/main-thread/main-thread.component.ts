import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../../models/post/post';
import { User } from '../../models/user';
import { Subject, of } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AuthenticationService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { AuthDialogService } from '../../services/auth-dialog.service';
import { DialogType } from '../../models/common/auth-dialog-type';
import { EventService } from '../../services/event.service';
import { NewPost } from '../../models/post/new-post';
import { delay, switchMap, takeUntil } from 'rxjs/operators';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { SnackBarService } from '../../services/snack-bar.service';
import { environment } from 'src/environments/environment';
import { GyazoService } from 'src/app/services/gyazo.service';
import { ToastrService } from 'ngx-toastr';
import { NewReaction } from 'src/app/models/reactions/newReaction';
import { Reaction } from 'src/app/models/reactions/reaction';
import { NewDisreaction } from 'src/app/models/disreactions/newDisreaction';
import { Disreaction } from 'src/app/models/disreactions/disreaction';
import { Comment } from '../../models/comment/comment';
import { ActivatedRoute } from '@angular/router';



@Component({
    selector: 'app-main-thread',
    templateUrl: './main-thread.component.html',
    styleUrls: ['./main-thread.component.sass']
})
export class MainThreadComponent implements OnInit, OnDestroy {
    public posts: Post[] = [];
    public cachedPosts: Post[] = [];
    public isOnlyMine = false;
    public isLikedMine = false;

    public currentUser: User;
    public imageUrl: string;
    public imageFile: File;
    public post = {} as NewPost;
    public showPostContainer = false;
    public loading = false;
    public loadingPosts = false;


    public postHub: HubConnection;

    private postId: number;
    private unsubscribe$ = new Subject<void>();


    public constructor(
        private route: ActivatedRoute,
        private toastr: ToastrService,
        private snackBarService: SnackBarService,
        private authService: AuthenticationService,
        private postService: PostService,
        private gyazoService: GyazoService,
        private authDialogService: AuthDialogService,
        private eventService: EventService
    ) { }

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.postHub.stop();
    }

    public ngOnInit() {



        // Выполняем обычную логику для главной страницы
        this.getPosts();
        this.getUser();

        this.eventService.userChangedEvent$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
            if (user == undefined) {
                this.hubDeleteGroup();
            }
            this.currentUser = user;
            this.post.authorId = this.currentUser ? this.currentUser.id : undefined;
            this.hubAddGroup();
        });
        this.registerHub();
        console.log('1haha')

    };


    private doSomethingWithPost(postId: number) {
        // Загрузить пост с заданным айди и выполнить какие-то действия
        // Например:

        // Добавить пост в массив posts
        this.posts.forEach(element => {
            if (element.id) {
                console.log(element.id)
            }

        });
        this.posts = this.cachedPosts.filter((x) => x.id === postId);



        // ... остальные действия

    }

    public getPosts() {
        this.loadingPosts = true;
        this.postService
            .getPosts()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (resp) => {
                    this.loadingPosts = false;
                    this.posts = this.cachedPosts = resp.body;
                    this.route.paramMap.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
                        this.postId = +params.get('id');
                        console.log('haha')
                        if (this.postId) {

                            // Выполняем логику для поста с заданным айди
                            this.doSomethingWithPost(this.postId);
                        }

                        // this.route.paramMap.subscribe(params => {
                        //     this.postId = parseInt(params.get('id'));
                        //         });

                    })
                },
                (error) => (this.loadingPosts = false)
            );

    }

    public sendPost() {


        const postSubscription = !this.imageFile
            ? this.postService.createPost(this.post)
            : this.gyazoService.uploadImage(this.imageFile).pipe(
                switchMap((imageData) => {
                    this.post.previewImage = imageData.url;
                    return this.postService.createPost(this.post);
                })
            );

        this.loading = true;

        postSubscription.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (respPost) => {

                this.addNewPost(respPost.body);
                this.removeImage();
                this.post.body = undefined;
                this.post.previewImage = undefined;
                this.loading = false;
                this.toastr.success('New Post Added');

            },
            (error) => this.snackBarService.showErrorMessage(error)
        );
    }

    public loadImage(target: any) {
        this.imageFile = target.files[0];

        if (!this.imageFile) {
            target.value = '';
            return;
        }

        if (this.imageFile.size / 1000000 > 5) {
            target.value = '';
            this.snackBarService.showErrorMessage(`Image can't be heavier than ~5MB`);
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => (this.imageUrl = reader.result as string));
        reader.readAsDataURL(this.imageFile);
    }

    public removeImage() {
        this.imageUrl = undefined;
        this.imageFile = undefined;
    }

    public sliderChanged(event: MatSlideToggleChange) {
        if (event.checked) {
            this.isOnlyMine = true;
        } else {
            this.isOnlyMine = false;
        }
        this.sliderIsChanged(this.isOnlyMine)
        this.sliderIsLiked(this.isLikedMine)

    }

    public sliderLiked(event: MatSlideToggleChange) {
        if (event.checked) {
            this.isLikedMine = true;
        } else {
            this.isLikedMine = false;
        }
        this.sliderIsChanged(this.isOnlyMine)
        this.sliderIsLiked(this.isLikedMine)

    }

    public toggleNewPostContainer() {
        this.showPostContainer = !this.showPostContainer;
    }

    public openAuthDialog() {
        this.authDialogService.openAuthDialog(DialogType.SignIn);
    }

    public registerHub() {
        this.postHub = new HubConnectionBuilder().withUrl(`${environment.apiUrl}/notifications/post`).build();
        this.postHub.onreconnected(() => {
            // Вызов invoke при установленном соединении
            if (this.postHub.state === HubConnectionState.Connected) {
                this.hubAddGroup();
            }
        });
        this.postHub.start()
            .then(() => {
                // Вызов invoke при установленном соединении
                if (this.postHub.state === HubConnectionState.Connected) {
                    this.hubAddGroup();
                }
            })
            .catch((error) => this.snackBarService.showErrorMessage(error));



















        this.postHub.on('NewPost', (newPost: Post) => {
            if (newPost) {
                this.addNewPost(newPost);
                console.log(newPost.id);

            }
        });
        this.postHub.on('EditPost', (editedPost: Post) => {
            if (editedPost) {
                const index = this.cachedPosts.findIndex(post => post.id === editedPost.id);
                if (editedPost.author.id != this.currentUser.id && (editedPost.body != this.cachedPosts[index].body || editedPost.previewImage != this.cachedPosts[index].previewImage)) {
                    this.toastr.success(`${editedPost.author.userName} edited his post`);
                }
                this.editPost(editedPost)






            }
        });
        this.postHub.on('DeletePost', (postId: number) => {
            if (postId) {

                var myPost = this.cachedPosts.find(x => x.id == postId)
                if (myPost.author.id != this.currentUser.id) {
                    this.toastr.success(`${myPost.author.userName} deleted his post`);
                }
                this.deletePost(postId)


            }
        });

        this.postHub.on('LikedPostUser', (post: Post, user: User) => {

            var myPost = this.posts.find(x => x.id === post.id)

            const react: Reaction = {
                isLike: true,
                user: user
            };
            myPost.reactions = myPost.reactions.concat(react);

            this.toastr.success(`${user.userName} liked your post. you ${post.author.email}`);





        });
        this.postHub.on('RemoveLikedPostUser', (reactionUserId: number, post: Post) => {


            var mypost = this.posts.find(x => x.id === post.id)
            mypost.reactions = mypost.reactions.filter((x) => x.user.id !== reactionUserId)

        });






        this.postHub.on('DisedPostUser', (post: Post, user: User) => {
            var myPost = this.posts.find(x => x.id === post.id)
            const disreact: Disreaction = {
                isDis: true,
                user: user
            };
            myPost.disreactions = myPost.disreactions.concat(disreact);



        });
        this.postHub.on('RemoveDisedPostUser', (disreactionUserId: number, post: Post) => {
            var mypost = this.posts.find(x => x.id === post.id)
            mypost.disreactions = mypost.disreactions.filter((x) => x.user.id !== disreactionUserId)

        });


        this.postHub.on('LikedCommentUser', (comment: Comment, postId: number, user: User) => {

            var likedPost = this.posts.find(x => x.id === postId)

            var myComment = likedPost.comments.find(x => x.id === comment.id)

            const react: Reaction = {
                isLike: true,
                user: user
            };
            myComment.reactions = myComment.reactions.concat(react);

            this.toastr.success(`${user.userName} liked your comment`);


        });
        this.postHub.on('RemoveLikedCommentUser', (reactionUserId: number, comment: Comment, postId: number) => {
            var likedPost = this.posts.find(x => x.id === postId)

            var myComment = likedPost.comments.find(x => x.id === comment.id)

            myComment.reactions = myComment.reactions.filter((x) => x.user.id !== reactionUserId)

        });

        this.postHub.on('DisedCommentUser', (comment: Comment, postId: number, user: User) => {

            var disedPost = this.posts.find(x => x.id === postId)

            var myComment = disedPost.comments.find(x => x.id === comment.id)

            const disreact: Disreaction = {
                isDis: true,
                user: user
            };
            myComment.disreactions = myComment.disreactions.concat(disreact);



        });
        this.postHub.on('RemoveDisedCommentUser', (disreactionUserId: number, comment: Comment, postId: number) => {
            var likedPost = this.posts.find(x => x.id === postId)

            var myComment = likedPost.comments.find(x => x.id === comment.id)

            myComment.disreactions = myComment.disreactions.filter((x) => x.user.id !== disreactionUserId)

        });










    }


    public addNewPost(newPost: Post) {
        if (!this.cachedPosts.some((x) => x.id === newPost.id)) {
            this.cachedPosts = this.sortPostArray(this.cachedPosts.concat(newPost));
            if (!this.isOnlyMine || (this.isOnlyMine && newPost.author.id === this.currentUser.id)) {
                this.posts = this.sortPostArray(this.posts.concat(newPost));
            }
            this.sliderIsLiked(this.isLikedMine)
        }
    }

    public editPost(editedPost: Post) {
        const index = this.cachedPosts.findIndex(post => post.id === editedPost.id);
        if (index > -1) {
            this.cachedPosts[index] = editedPost;
            this.cachedPosts = this.sortPostArray(this.cachedPosts);
            if (!this.isOnlyMine || (this.isOnlyMine && editedPost.author.id === this.currentUser.id)) {
                const postIndex = this.posts.findIndex(post => post.id === editedPost.id);
                if (postIndex > -1) {
                    this.posts[postIndex] = editedPost;
                    this.posts = this.sortPostArray(this.posts);
                }
            }
        }
    }

    public deletePost(deletedPostId: number) {
        this.cachedPosts = this.cachedPosts.filter(post => post.id !== deletedPostId);
        if (!this.isOnlyMine || (this.isOnlyMine && this.posts.find(post => post.id === deletedPostId)?.author.id === this.currentUser.id)) {
            this.posts = this.posts.filter(post => post.id !== deletedPostId);
        }
    }

    public likePostSort(post: Post, reaction: NewReaction) {

    }

    public hubAddGroup() {
        if (this.currentUser) {
            this.postHub.invoke('AddUserToGroup', this.currentUser.id)
        }
    }

    private hubDeleteGroup() {
        if (this.currentUser) {
            this.postHub.invoke('DeleteUserToGroup', this.currentUser.id)
        }
    }


    private getUser() {
        this.authService
            .getUser()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((user) => (this.currentUser = user));
    }

    private sortPostArray(array: Post[]): Post[] {
        return array.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }



    private sliderIsChanged(isOnlyMine: boolean) {
        if (isOnlyMine) {
            this.posts = this.cachedPosts.filter((x) => x.author.id === this.currentUser.id);
        } else {
            this.posts = this.cachedPosts;
        }

    }

    private sliderIsLiked(isLikedMine: boolean) {
        if (isLikedMine) {
            const reactionsWithId = this.posts.reduce((acc, post) => acc.concat(post.reactions.filter(reaction => reaction.user.id === this.currentUser.id)), []);
            this.posts = this.cachedPosts.filter(post => post.reactions.some(reaction => reactionsWithId.includes(reaction)));
        }
    }
}
