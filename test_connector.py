from agent.data_connector import DataConnector

connector = DataConnector()
region = "강남구"
lawd_cd = connector.get_lawd_cd(region)
print(f"Region: {region} -> Lawd Code: {lawd_cd}")

if lawd_cd == "11680":
    print("✅ Lawd Code Mapping Test Passed")
else:
    print("❌ Lawd Code Mapping Test Failed")
