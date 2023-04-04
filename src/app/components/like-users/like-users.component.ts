import { Component, Input, OnInit } from '@angular/core';
import { Comment } from 'src/app/models/comment/comment';
import { Post } from 'src/app/models/post/post';

@Component({
  selector: 'app-like-users',
  templateUrl: './like-users.component.html',
  styleUrls: ['./like-users.component.sass']
})
export class LikeUsersComponent implements OnInit {
  @Input() public reactions: Post["reactions"];
  @Input() public commentReactions: Comment["reactions"];

  constructor() { }

  ngOnInit(): void {

  }

}
