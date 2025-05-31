import { ChatPreviewRowProps } from "../components/ChatPreviewRow";
import { User, UserStatus } from "../components/UserRow";

export const mockKevinUser: User = { id: "kevk11", firstName: "Kevin", lastName: "Kim", photoUrl: { uri: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80" }, availability: { status: UserStatus.Available, location: { latitude: 0.5, longitude: 0 }, memo: "Grabbin a quick iced coffee!" } }

export const mockMonaUser: User = { id: "msinclair", firstName: "Mona", lastName: "Sinclair", photoUrl: { uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80" }, availability: { status: UserStatus.Available, location: { latitude: 0.11, longitude: 0.1 }, memo: "Running some errands at Target and Home Depot :)" } }

export const mockCameronUser: User = { id: "camgreene", firstName: "Cameron", lastName: "Greene", photoUrl: { uri: "https://images.unsplash.com/photo-1611703372231-02ffff8abee6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=986&q=80" }, availability: { status: UserStatus.Available, location: { latitude: 4, longitude: 10 }, memo: "Gonna check out the new exhibit at the Art Institute" } }

export const mockUsers: User[] = [
  mockKevinUser,
  mockMonaUser,
  mockCameronUser
]

export const mockChats: ChatPreviewRowProps[] = [{ id: "chat1", users: mockUsers, messages: [{ sender: mockMonaUser, text: "Thoughts on heading to Oak St beach?", id: "ChatMona1" }, { sender: mockKevinUser, text: "I'm so down!", id: "ChatKevin1" }, { sender: mockMonaUser, text: "Great. I'll start getting ready.", id: "ChatMona2" }] }, { id: "chat2", users: [mockCameronUser], messages: [{ sender: mockCameronUser, text: "Wanna join my other plan?", id: "ChatCameron1" }] }]

export const presetActivities = {
  walking: { id: 289, name: "walking" },
  concerts: { id: 158, name: "concerts" },
  hiking: { id: 28, name: "hiking" },
  coffee: { id: 63, name: "coffee"},
  surfing: { id: 67, name: "surfing"}

};

export const stateAbbreviations: { [key: string]: string } = {
  "Alabama": "AL",
  "Alaska": "AK",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "District of Columbia": "DC",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY"
};
