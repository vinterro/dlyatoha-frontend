import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Post } from "src/app/models/post/post";
import { User } from "src/app/models/user";
import { SnackBarService } from "src/app/services/snack-bar.service";

import { Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { PostService } from "src/app/services/post.service";
import { GyazoService } from "src/app/services/gyazo.service";
import { Subject, switchMap, takeUntil } from "rxjs";



@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.sass']
})
export class EditComponent implements OnInit, OnDestroy {

    @Input() public currentUser: User;

    public post: Post;
    public originalPost: Post;
    public isOriginalPost = true;
    public imageUrl: string;
    public imageFile: File;
    public loading = false;
    private unsubscribe$ = new Subject<void>();

    public constructor(
        private postService: PostService,
        private gyazoService: GyazoService,
        private snackBarService: SnackBarService,
        public dialogRef: MatDialogRef<EditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { post: Post }
    ) {

    }
    ngOnInit(): void {
        this.post = this.data.post;
        this.originalPost = { ...this.data.post };


    }

    ngOnDestroy(): void {
        if (this.isOriginalPost) {
            this.post.body = this.originalPost.body;
            const originalPostSubscription = this.postService.editPost(this.originalPost);

            this.loading = true;


            originalPostSubscription.pipe(takeUntil(this.unsubscribe$)).subscribe(
                (respPost) => {
                    this.editPost(respPost.body);
                    this.loading = false;
                },
                (error) => this.snackBarService.showErrorMessage(error)
            );
            console.log("edit close", this.originalPost.body);
        }


    }

    public sendEditPost() {
        this.isOriginalPost = false;
        console.log('send', this.post)
        const postSubscription = !this.imageFile
            ? this.postService.editPost(this.post)
            : this.gyazoService.uploadImage(this.imageFile).pipe(
                switchMap((imageData) => {
                    this.post.previewImage = imageData.url;
                    return this.postService.editPost(this.post);
                })
            );

        this.loading = true;

        postSubscription.pipe(takeUntil(this.unsubscribe$)).subscribe(
            (respPost) => {
                this.editPost(respPost.body);
                this.loading = false;
            },
            (error) => this.snackBarService.showErrorMessage(error)
        );

        this.dialogRef.close({ action: 'save' });
    }



    public close() {
        this.dialogRef.close({ action: 'close' });
    }

    public editPost(editedPost: Post) {
        this.post = editedPost;

        console.log('edit', editedPost)


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
        this.post.previewImage = undefined;
        this.imageUrl = undefined;
        this.imageFile = undefined;
    }




}
