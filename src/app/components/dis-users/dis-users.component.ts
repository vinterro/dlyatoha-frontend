import { Component, Input, OnInit } from '@angular/core';
import { Post } from 'src/app/models/post/post';
import { Comment } from '../../models/comment/comment';


@Component({
  selector: 'app-dis-users',
  templateUrl: './dis-users.component.html',
  styleUrls: ['./dis-users.component.sass']
})
export class DisUsersComponent implements OnInit {
  @Input() public disreactions: Post["disreactions"];
  @Input() public commentDisreactions: Comment["disreactions"];

  constructor() { }

  ngOnInit(): void {
  }

}
