export type Nullable<T> = T | null;

export type Undefinable<T> = T | undefined;

export enum Action
{
	Status = "Status",
	NextServerReset = "NextServerReset",
	Exit = "Exit",

	Register = "Register",
	Authenticate = "Authenticate",

	GetAgent = "GetAgent",
	ListAgents = "ListAgents",
	GetPublicAgent = "GetPublicAgent",

	GetContract = "GetContract",
	ListContracts = "ListContracts",
	AcceptContract = "AcceptContract",
	DeliverCargoToContract = "DeliverCargoToContract",
	FulfillContract = "FulfillContract",

	GetFaction = "GetFaction",
	ListFactions = "ListFactions",

	GetSystem = "GetSystem",
	ListSystems = "ListSystems",
	GetWaypoint = "GetWaypoint",
	ListWaypoints = "ListWaypoints",
	GetMarket = "GetMarket",
	GetShipyard = "GetShipyard",
	GetJumpgate = "GetJumpgate",
	GetConstructionSite = "GetConstructionSite",
	SupplyConstructionSite = "SupplyConstructionSite",

	GetShip = "GetShip",
	GetShipCargo = "GetShipCargo",
	ListShips = "ListShips",
	PurchaseShip = "PurchaseShip",
	OrbitShip = "OrbitShip",
	ShipRefine = "ShipRefine",
	CreateChart = "CreateChart",
	GetShipCooldown = "GetShipCooldown",
	DockShip = "DockShip",
	CreateSurvey = "CreateSurvey",
	ExtractResources = "ExtractResources",
	SiphonResources = "SiphonResources",
	ExtractResourcesWithSurvey = "ExtractResourcesWithSurvey",
	JettisonCargo = "JettisonCargo",
	JumpShip = "JumpShip",
	NavigateShip = "NavigateShip",
	PatchShipNav = "PatchShipNav",
	GetShipNav = "GetShipNav",
	WarpShip = "WarpShip",
	SellCargo = "SellCargo",
	ScanSystems = "ScanSystems",
	ScanWaypoints = "ScanWaypoints",
	ScanShips = "ScanShips",
	RefuelShip = "RefuelShip",
	PurchaseCargo = "PurchaseCargo",
	TransferCargo = "TransferCargo",
	NegotiateContract = "NegotiateContract",
	GetMounts = "GetMounts",
	InstallMount = "InstallMount",
	RemoveMount = "RemoveMount",
	GetShipScrap = "GetShipScrap",
	ScrapShip = "ScrapShip",
	GetRepairShip = "GetRepairShip",
	RepairShip = "RepairShip",
}

export interface IActionModule
{
	// If true, this action can be run without a registered client.
	Static: Undefinable<boolean>;
	Description: Undefinable<string>;

	Run: (client: Undefinable<SpaceTraders>) => Promise<any>;
};
