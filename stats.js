const STATS = {

}


// Example of match data
// {
//     "id": "8128594",
//     "type": "matches",
//     "attributes": {
//         "ranked": true,
//         "number-of-rounds": 3,
//         "state": 1,
//         "winner": 0,
//         "home-score": 0,
//         "away-score": 0,
//         "home-user-id": 323214,
//         "away-user-id": 68225,
//         "created-at": "2021-05-12T10:07:41.634Z",
//         "home-team": [
//             {
//                 "id": 323214,
//                 "UserName": "Whirligig",
//                 "ELO": 1859.8,
//                 "Rank": 3663,
//                 "Wins": 813,
//                 "Losses": 706,
//                 "LastOnline": "2021-05-13T22:35:49.709Z"
//             }
//         ],
//         "away-team": [
//             {
//                 "id": 68225,
//                 "UserName": "RobGB",
//                 "ELO": 1895.1,
//                 "Rank": 3076,
//                 "Wins": 108,
//                 "Losses": 66,
//                 "LastOnline": "2021-05-12T10:14:13.826Z"
//             }
//         ],
//         "elo-change": 20,
//         "home-elo": 1804.2,
//         "away-elo": 1915.1
//     },
//     "relationships": {
//         "rounds": {
//             "data": [
//                 {
//                     "id": "18212478",
//                     "type": "rounds"
//                 },
//                 {
//                     "id": "18212417",
//                     "type": "rounds"
//                 },
//                 {
//                     "id": "18212353",
//                     "type": "rounds"
//                 }
//             ]
//         }
//     }
// },

// Example of round data
// {
//     "id": "18212478",
//     "type": "rounds",
//     "attributes": {
//         "id": 18212478,
//         "away-score": 11,
//         "home-score": 13,
//         "match-id": 8128594,
//         "round-number": 0,
//         "state": 0,
//         "winner": -1,
//         "created-at": "2021-05-12T10:11:50.722Z"
//     }
// },
function calculateStats(matches, rounds) {

}
