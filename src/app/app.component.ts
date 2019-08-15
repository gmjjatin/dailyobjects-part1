import {Component, OnInit} from '@angular/core';
import {User} from "./models/user";
import {UserService} from "./services/user.service";
import {Subject} from "rxjs";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'Dailyobjects Assignment - Part1';


    cache = {
        users: [],
        selectedUser: [],
        selectedUserDetail: [],
    };

    users: User[] = [];
    search: Subject<string> = new Subject<string>();
    selectedUser: User = new User();
    selectedUserDetail: User = new User();
    loadingFollowers: boolean = false;
    loadingDetails: boolean = false;


    constructor(private userService: UserService) {

        this.search.debounceTime(200).distinctUntilChanged().subscribe((searchTerm) => {

            // call to user service and search by query

            this.userService.search(searchTerm).subscribe(res => {

                this.users = res.items as User[];
            });
        })
    }

    ngOnInit() {


        this.userService.getUsers().subscribe(res => {

            console.log('users',res)
            this.cache.users = res; // store cached for next time.

            this.users = res;
        }, error => {

            console.log(error); // for development only.
        });

    }

    /**
     * On user typing key to search.
     */
    onSearch(q: string) {

      this.selectedUser = new User();
      this.selectedUserDetail = new User();
      
        if (q !== "") {
            this.search.next(q);
        } else {
            //if empty search box we restore first users
            this.users = this.cache.users;
        }

    }

    // Acts like a router
    go(s: string) {

        if (s == 'home') {

            this.selectedUser = new User();
            this.selectedUserDetail = new User();
            this.users = this.cache.users;
        }
    }

    // Load Followers Page
    viewFollower(user: User) {

        this.selectedUser = user;
        this.selectedUserDetail = new User();

        let userInCache: User = this.findUserInCache(user);
        // let find if existing in cache we return and no longer call to api again
        if (userInCache) {
            this.selectedUser = userInCache;
        } else {
            // get followers of this user
            this.loadingFollowers = true;

            this.userService.getUserFollowers(user.login).subscribe(res => {
                this.selectedUser.followers = res as User[];

                this.cacheSelectUser(this.selectedUser);

                this.loadingFollowers = false;

            }, err => {
                console.log(err);
                this.loadingFollowers = false;
            });

        }


    }

    // Load User Details, Repos Page
    viewDetail(user: User) {
        this.selectedUser = new User();
        this.selectedUserDetail = user;

        let userInCache: User = this.findUserDetailInCache(user);
        // let find if existing in cache we return and no longer call to api again
        if (userInCache) {
            this.selectedUserDetail = userInCache;
        } else {
            // get followers of this user
            this.loadingDetails = true;

            this.userService.getUserDetails(user.login).subscribe(res => {
                this.selectedUserDetail = res as User[];

                this.userService.getUserRepoDetail(user.login).subscribe(res => {
                    this.selectedUserDetail.repos = res;
                    this.cacheSelectUserDetail(this.selectedUserDetail);
                    this.loadingDetails = false;
                });

            }, err => {
                console.log(err);
                this.loadingDetails = false;
            });

        }

    }

    /**
     * we store selected user in cache
     * */

    cacheSelectUser(user: User) {
        if (!this.findUserInCache(user)) {
            this.cache.selectedUser.push(user);
        }

    }

    cacheSelectUserDetail(user: User) {
        if (!this.findUserInCache(user)) {
            this.cache.selectedUserDetail.push(user);
        }

    }

    /**
     * Find user if exist in cache we return user object
     * @param user
     * @returns {boolean}
     */
    findUserInCache(user: User): User {

        for (var i = 0; i < this.cache.selectedUser.length; i++) {
            if (this.cache.selectedUser[i].login == user.login) {
                return this.cache.selectedUser[i];
            }
        }

        return null;
    }

    findUserDetailInCache(user: User): User {

        for (var i = 0; i < this.cache.selectedUserDetail.length; i++) {
            if (this.cache.selectedUserDetail[i].login == user.login) {
                return this.cache.selectedUserDetail[i];
            }
        }

        return null;
    }
}
